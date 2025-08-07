# Advanced CRUD Generator v2.0 🚀

A powerful Node.js tool that generates complete CRUD operations with visual table builder, enhanced controllers, services, routes, and comprehensive Swagger API documentation.

## 🎉 **NEW in v2.0**

- 🗂️ **Separate Swagger Sections**: Paths, Request Schemas, and Response Schemas in individual tabs
- 📋 **Enhanced Swagger Documentation**: Detailed API documentation with emojis, examples, and smart field descriptions
- 🎨 **Visual Table Builder**: Interactive UI to design tables with columns and data types
- ⚙️ **Advanced Code Generation**: Enhanced controllers, services with better error handling and validation
- 🎯 **Smart Field Detection**: Automatically generates appropriate examples based on field names
- 💾 **Cache-Busting**: Prevents browser caching issues with dynamic headers
- 📱 **Mobile Responsive**: Works seamlessly on all devices
- 🔄 **Real-time Preview**: See your table structure before generating code

## ✨ Features

- 🎨 **Visual Table Builder**: Interactive UI to design tables with columns
- 🔧 **Complete CRUD Generation**: Models, Controllers, Services, and Routes
- 📖 **Comprehensive Swagger Documentation**: API documentation with examples and descriptions
- 🎯 **Smart Validation**: Automatic field validation and error handling
- 📝 **Logging Integration**: Built-in Winston logging support
- 🔄 **Production-Ready Code**: Follows real project patterns and best practices
- 🌐 **Modern UI**: Beautiful, responsive design with Font Awesome icons
- 📋 **Copy & Paste Ready**: Generated code ready for immediate use

## Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation
1. **Clone the repository:**
   ```sh
   git clone https://github.com/Jamaludheen2426/Crud_Gen.git
   cd Crud_Gen
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```

## Running the Project
Start the server with:
```sh
node index.js
```
The app will run on [http://localhost:3000](http://localhost:3000) by default.

## 🎯 How to Use v2.0

### **Method 1: Visual Table Builder (NEW!)**
1. Open [http://localhost:3000](http://localhost:3000)
2. Use the **📊 Table Builder** tab:
   - Enter table name (e.g., "Student", "Product")
   - Specify primary key column name
   - Add columns with data types and nullable options
3. Check the **👁️ Preview** tab to see your table structure
4. Click **⚡ Generate Code** to create all files
5. Use the separate tabs to copy:
   - 📄 **Model**: Sequelize model definition
   - 🎮 **Controller**: Complete CRUD operations
   - ⚙️ **Service**: Database interaction layer
   - 🛣️ **Routes**: Express router configuration
   - 🗂️ **Paths**: Swagger API paths
   - 📋 **Request**: Swagger request schemas
   - 📄 **Response**: Swagger response schemas

### **Method 2: Legacy Generator**
1. Visit [http://localhost:3000/legacy](http://localhost:3000/legacy)
2. Paste your existing Sequelize model definition
3. Enter the model name and primary key field
4. Click "Generate CRUD Operations"
5. Copy the generated code from the respective tabs

## 🆕 What's Generated in v2.0

### **Enhanced Models**
- Full Sequelize model with proper validations
- Support for all data types (STRING, INTEGER, BOOLEAN, DATE, TEXT, DECIMAL, FLOAT, ENUM, JSON)
- Automatic system fields (Active, Deleted, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy)

### **Advanced Controllers**
- Complete CRUD operations (GET, POST, PUT)
- Smart validation for required fields
- Enhanced error handling with proper status codes
- Logging integration with Winston
- Request/Response formatting

### **Robust Services**
- Database abstraction layer
- Proper error handling and logging
- Optimized queries with specific attributes
- Soft delete support

### **Professional Routes**
- RESTful API endpoints
- Proper route organization
- Express router implementation

### **Comprehensive Swagger Documentation**
- **Paths Section**: Complete API endpoint definitions with examples
- **Request Schemas**: Detailed input validation schemas
- **Response Schemas**: All possible API responses
- **Smart Examples**: Field-specific example values
- **Emoji Documentation**: Easy-to-read documentation with visual indicators
- **Error Handling**: Comprehensive error response schemas

## Example
Paste a Sequelize model like this:
```js
const DataTypes = require("sequelize");
const sequelize = require('../config/db.config');

module.exports = (sequelize, Sequelize) => {
    const banner = sequelize.define('Banner', {
        BannerId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        BannerImgurl: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        BannerTitle: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        Active: {
            type: DataTypes.STRING(1),
            defaultValue: "T",
            allowNull: false,
        },
        Deleted: {
            type: DataTypes.STRING(1),
            defaultValue: "F",
            allowNull: false,
        },
        CreatedBy: {
            type: DataTypes.INTEGER
        },
        UpdatedBy: {
            type: DataTypes.INTEGER,
        },
        CreatedDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        UpdatedDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'Banner',
        timestamps: false,
    });
    return banner;
};
```

## License

This project is licensed under the [MIT License](LICENSE). 