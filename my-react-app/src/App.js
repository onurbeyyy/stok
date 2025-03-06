/* App.css */
body {
  font-family: Arial, sans-serif;
  background-color: #f8f9fa;
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.header {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.stock-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.stock-table {
  width: 45%;
  background-color: white;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.stock-table h2 {
  text-align: center;
  font-size: 18px;
  margin-bottom: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

.sidebar {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  padding: 10px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  text-align: center;
  width: 150px;
}

.btn-warning {
  background-color: orange;
  color: white;
}

.btn-primary {
  background-color: blue;
  color: white;
}

.btn-danger {
  background-color: red;
  color: white;
}

.btn-secondary {
  background-color: gray;
  color: white;
}
