from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, func
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

# FastAPI uygulamasını oluştur
app = FastAPI()

# CORS hatasını düzelt
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Veritabanı bağlantısı
DATABASE_URL = "mssql+pyodbc://sa:derasew@localhost/pub?driver=ODBC+Driver+17+for+SQL+Server"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# **Model Tanımlamaları**
class InventoryItem(Base):
    __tablename__ = "InventoryItems"
    Id = Column(Integer, primary_key=True)
    Name = Column(String)

class Warehouse(Base):
    __tablename__ = "Warehouses"
    Id = Column(Integer, primary_key=True)
    Name = Column(String)

class InventoryTransaction(Base):
    __tablename__ = "InventoryTransactions"
    Id = Column(Integer, primary_key=True)
    InventoryTransactionDocumentId = Column(Integer)
    InventoryTransactionTypeId = Column(Integer)
    SourceWarehouseId = Column(Integer)
    TargetWarehouseId = Column(Integer)
    Date = Column(DateTime)
    Unit = Column(String)
    Multiplier = Column(Integer)
    Quantity = Column(Float)  
    TotalPrice = Column(Float)
    ExchangeRate = Column(Float)
    InventoryItem_Id = Column(Integer)

class InventoryTransactionDocument(Base):
    __tablename__ = "InventoryTransactionDocuments"
    Id = Column(Integer, primary_key=True)
    Date = Column(DateTime)
    InventoryDocumentTransactionTypeId = Column(Integer)
    TransactionAccountTransactionTypeId = Column(Integer)
    AccountTypeId = Column(Integer)
    AccountId = Column(Integer)
    Description = Column(String)
    ForeignCurrencyId = Column(Integer)
    Name = Column(String)
    AccountTransactionDocument_Id = Column(Integer)

# **Veritabanı Tablolarını Oluştur**
Base.metadata.create_all(bind=engine)

# **Veritabanı Bağlantısı**
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# **Stok Listesi Getir**
@app.get("/stocks")
def get_stocks(db: Session = Depends(get_db)):
    items = db.query(InventoryItem).all()
    return items

# **Depo Listesi Getir**
@app.get("/warehouses")
def get_warehouses(db: Session = Depends(get_db)):
    warehouses = db.query(Warehouse).all()
    return warehouses

# **Son Transferleri Getir**
@app.get("/recent_transfers")
def get_recent_transfers(db: Session = Depends(get_db)):
    recent_transfers = (
        db.query(InventoryTransaction)
        .order_by(InventoryTransaction.Date.desc())
        .limit(5)
        .all()
    )
    return [{"Id": t.Id, "Description": f"{t.Quantity} adet {t.InventoryItem_Id} ID'li ürün transfer edildi"} for t in recent_transfers]

# **Depo Stok Bilgilerini Getir**
@app.get("/stock_details")
def get_stock_details(db: Session = Depends(get_db)):
    """
    Her ürün için depo bazlı stok miktarını hesaplayan API endpoint.
    """
    transactions = db.query(InventoryTransaction).all()
    
    stock_data = {}
    
    for transaction in transactions:
        item_id = transaction.InventoryItem_Id
        source_warehouse_id = transaction.SourceWarehouseId
        target_warehouse_id = transaction.TargetWarehouseId
        quantity = transaction.Quantity

        # Eğer ürün listede yoksa ekleyelim
        if item_id not in stock_data:
            stock_data[item_id] = {}

        # Eğer kaynak depodan çıkış varsa, stok azalt
        if source_warehouse_id not in stock_data[item_id]:
            stock_data[item_id][source_warehouse_id] = 0
        stock_data[item_id][source_warehouse_id] -= quantity  # Depodan çıkış
        
        # Eğer hedef depoya giriş varsa, stok artır
        if target_warehouse_id not in stock_data[item_id]:
            stock_data[item_id][target_warehouse_id] = 0
        stock_data[item_id][target_warehouse_id] += quantity  # Depoya giriş

    return stock_data  # JSON formatında döndür

# **Stok Transferi Yap (Tedarikçiden alım ve depo içi transferleri düzenledim)**
@app.put("/transfer_stock/{item_id}")
def transfer_stock(item_id: int, source_warehouse_id: int = 0, target_warehouse_id: int = 1, quantity: float = 0, db: Session = Depends(get_db)):
    """
    - **Kaynak depo 0 ise** → Tedarikçiden alım olarak işlenir.
    - **Kaynak depo farklı ise** → Depo içi transfer olarak işlenir.
    - **Tedarikçiden alım için stok kontrolü yapılmaz.**
    - **Depo içi transferlerde stok kontrolü yapılır.**
    """

    is_supplier = source_warehouse_id == 0
    transaction_type = "Tedarikçiden Alım" if is_supplier else "Depo İçi Transfer"

    # **Eğer kaynak depo 0 değilse ve yetersiz stok varsa işlem yapmasın**
    if not is_supplier:
        total_in_source = db.query(func.sum(InventoryTransaction.Quantity)).filter(
            InventoryTransaction.InventoryItem_Id == item_id,
            InventoryTransaction.TargetWarehouseId == source_warehouse_id
        ).scalar() or 0

        if total_in_source < quantity:
            raise HTTPException(status_code=400, detail="Yetersiz stok.")

    # **Transfer belgesi oluştur**
    document = InventoryTransactionDocument(
        Date=datetime.now(),
        InventoryDocumentTransactionTypeId=1 if is_supplier else 2,
        TransactionAccountTransactionTypeId=10,
        AccountTypeId=6,
        AccountId=4111,
        Description=transaction_type,
        ForeignCurrencyId=0,
        Name=f"{transaction_type} - {datetime.now().strftime('%d %B %Y %A')}",
        AccountTransactionDocument_Id=None
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    # **Yeni transfer kaydını ekle**
    transaction = InventoryTransaction(
        InventoryTransactionDocumentId=document.Id,
        InventoryTransactionTypeId=1 if is_supplier else 2,
        SourceWarehouseId=source_warehouse_id,
        TargetWarehouseId=target_warehouse_id,
        Date=datetime.now(),
        Unit="ADET",
        Multiplier=1,
        Quantity=quantity,
        TotalPrice=0,
        ExchangeRate=1,
        InventoryItem_Id=item_id
    )

    db.add(transaction)
    db.commit()

    return {"detail": f"{transaction_type} başarılı!"}
