# CRUD Generator

A simple and powerful CRUD (Create, Read, Update, Delete) code generator for Node.js projects using Sequelize ORM. This tool helps you quickly scaffold controllers, services, and route files for your Sequelize models, saving development time and ensuring consistency across your codebase.

## Features
- Generate Controller, Service, and Route code for any Sequelize model
- Supports RESTful API patterns
- Includes both plain and Swagger-annotated route templates
- User-friendly web interface
- Error handling and logging patterns included in generated code

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

## Usage
1. Open your browser and go to [http://localhost:3000](http://localhost:3000)
2. Paste your Sequelize model definition in the provided textarea.
3. Enter the model name and primary key field.
4. Click "Generate CRUD Operations".
5. Copy the generated Controller, Service, Routes, or Swagger Routes code for use in your project.

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