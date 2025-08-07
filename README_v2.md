# Advanced CRUD Generator v2.0

🚀 **A powerful visual CRUD generator for Node.js applications with Sequelize ORM**

Generate complete CRUD operations including Models, Controllers, Services, Routes, and Swagger documentation based on your existing project structure.

## ✨ Features

### Enhanced Visual Interface
- 📊 **Visual Table Builder** - Design your database tables with an intuitive interface
- 🎯 **Column Management** - Add, edit, and remove columns with data type selection
- 👀 **Real-time Preview** - See your table structure before generating code
- 📱 **Responsive Design** - Works perfectly on all device sizes

### Code Generation
- 🏗️ **Model Generation** - Sequelize models with proper validations
- 🎮 **Controller Generation** - Complete CRUD controllers matching your project structure
- ⚙️ **Service Layer** - Database operations with error handling
- 🛣️ **Route Generation** - Express routes with proper structure
- 📚 **Swagger Documentation** - Complete API documentation schemas

### Project Structure Matching
- 🎯 **Analyzes your existing backend project structure**
- 🔄 **Generates code that matches your naming conventions**
- ✅ **Follows your project patterns and best practices**
- 🛡️ **Includes proper error handling and logging**

## 🚀 Quick Start

### Installation
```bash
# Clone or download the project
cd Crud_Gen

# Install dependencies
npm install

# Start the server
npm start
```

### Access the Generator
- **Enhanced Generator**: http://localhost:3000 (Recommended)
- **Legacy Generator**: http://localhost:3000/legacy

## 📖 How to Use

### Step 1: Configure Your Table
1. Enter your table name (e.g., "Category", "User", "Product")
2. Specify the primary key column name (e.g., "CategoryId", "UserId")

### Step 2: Define Columns
1. Add columns using the visual column builder
2. For each column specify:
   - **Column Name**: The field name
   - **Data Type**: Choose from STRING, INTEGER, BOOLEAN, DATE, TEXT, DECIMAL, etc.
   - **Nullable**: Whether the field is required or optional

### Step 3: Preview Your Table
- Review the complete table structure
- See all columns including auto-generated system columns (Active, Deleted, CreatedAt, etc.)

### Step 4: Generate Code
- Click "Generate CRUD Code"
- Get complete files for:
  - 📄 **Model** (Sequelize model definition)
  - 🎮 **Controller** (CRUD operations with validation)
  - ⚙️ **Service** (Database operations)
  - 🛣️ **Routes** (Express routing)
  - 📚 **Swagger** (API documentation schemas)

## 📁 Generated Code Structure

### Model (`category.model.js`)
```javascript
const DataTypes = require("sequelize");
module.exports = (sequelize, Sequelize) => {
    const Category = sequelize.define('Category', {
        CategoryId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        CategoryName: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        // Standard fields included automatically
        Active: { type: DataTypes.STRING(1), defaultValue: 'T' },
        Deleted: { type: DataTypes.STRING(1), defaultValue: 'F' },
        // ... timestamps and audit fields
    });
    return Category;
};
```

### Controller (`category.controller.js`)
- ✅ Complete CRUD operations
- 🛡️ Input validation
- 📊 Proper error handling
- 📝 Comprehensive logging
- 🎯 Matches your project's controller structure

### Service (`category.service.js`)
- 🗃️ Database operations
- 🔍 Proper filtering (Active/Deleted)
- 📊 Error handling with custom codes
- 🎯 Matches your project's service patterns

### Routes (`category.route.js`)
- 🛣️ RESTful endpoint definitions
- 🎯 Clean route structure
- 🔄 Follows your project conventions

### Swagger Schemas
- 📚 Complete request/response schemas
- ✅ Validation rules
- 📋 Error response definitions

## 🎯 Project Structure Analysis

The generator analyzes your existing project at `C:\Jamal\checkdoors-admin-backend` to:

- 📂 Match your folder structure
- 🏷️ Follow your naming conventions
- 🎨 Use your coding patterns
- 🛡️ Include your error handling approach
- 📝 Match your logging style

## 🔧 Configuration

### Supported Data Types
- **STRING** - Variable length string (255 chars)
- **INTEGER** - Whole numbers
- **BOOLEAN** - True/false values
- **DATE** - Date and time
- **TEXT** - Long text content
- **DECIMAL** - Decimal numbers
- **FLOAT** - Floating point numbers
- **ENUM** - Enumerated values
- **JSON** - JSON data

### Auto-Generated System Fields
Every table automatically includes:
- `Active` - Record status (T/F)
- `Deleted` - Soft delete flag (T/F)
- `CreatedAt` - Creation timestamp
- `UpdatedAt` - Last update timestamp
- `CreatedBy` - User who created the record
- `UpdatedBy` - User who last updated the record

## 📝 File Structure
```
Crud_Gen/
├── index.js                    # Main server file
├── package.json                # Project dependencies
├── README.md                   # This file
└── public/
    ├── enhanced-index.html     # New visual interface
    └── index.html              # Legacy interface
```

## 🚀 Integration with Your Project

### Step 1: Copy Generated Files
1. Copy the model file to: `server/src/app/models/`
2. Copy the controller to: `server/src/app/controllers/`
3. Copy the service to: `server/src/app/service/`
4. Copy the route to: `server/src/app/routes/`

### Step 2: Register the Route
Add to your main route file:
```javascript
const categoryRoutes = require('./routes/category.route');
app.use('/api/category', categoryRoutes);
```

### Step 3: Register the Model
Add to your database configuration:
```javascript
db.category = require('./models/category.model')(sequelize, Sequelize);
```

## 🔄 API Endpoints Generated

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/category` | Get all categories |
| GET | `/api/category/:id` | Get category by ID |
| POST | `/api/category` | Create new category |
| PUT | `/api/category/:id` | Update category |

## 🛡️ Error Handling

Generated code includes comprehensive error handling:
- Input validation errors
- Database operation errors  
- Not found errors
- Internal server errors
- Custom error codes and messages

## 📊 Logging

All operations include proper logging:
- Info logs for successful operations
- Error logs with context
- Performance tracking
- Audit trail information

## 🆚 Legacy vs Enhanced Generator

| Feature | Legacy | Enhanced |
|---------|---------|----------|
| Visual Interface | ❌ | ✅ |
| Column Builder | ❌ | ✅ |
| Table Preview | ❌ | ✅ |
| Model Generation | ❌ | ✅ |
| Project Structure Matching | ❌ | ✅ |
| Swagger Schemas | Partial | ✅ |
| Input Validation | Basic | Advanced |
| Error Handling | Basic | Comprehensive |

## 🤝 Contributing

Feel free to contribute by:
- Adding new data types
- Improving the UI
- Adding more project structure templates
- Enhancing code generation patterns

## 📄 License

ISC License - Feel free to use in your projects!

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Ensure your input data is valid
3. Verify the generated code matches your project structure
4. Test the generated endpoints in your application

---

**Built with ❤️ for rapid development** | **Version 2.0** | **Enhanced Visual CRUD Generator**
