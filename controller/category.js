const express = require("express");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const Product = require("../model/product");
const Category = require("../model/category");
const Order = require("../model/order");
const Shop = require("../model/shop");
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const fs = require("fs");
const path = require("path");

// create category
router.post(
  "/create-category",

  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name } = req.body;
      const categoryName = await Category.findOne({ name });
      // console.log("create category backend 20/6-2");

      if (categoryName) {
        const filename = req.file.filename;
        const filePath = `uploads/${filename}`;

        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
            res.status(500).json({ message: "Error deleting file" });
          }
        });
        return next(new ErrorHandler("Category already exists", 400));
      }

      const filename = req.file.filename;
      const fileUrl = path.join(filename);

      const categoryData = req.body;
      // const categoryNew = {
      //   image: fileUrl,
      //   name: name,
      // };
      categoryData.image = fileUrl;
      // categoryData.name = name;

      // console.log(categoryNew);
      const category = await Category.create(categoryData);
      // const category = await Category.create(categoryNew);

      res.status(201).json({
        success: true,
        category,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get all products of a shop
router.get(
  "/get-all-categories-shop/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const categories = await Category.find({ shopId: req.params.id });
      res.status(201).json({
        success: true,
        categories,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get all categories
router.get(
  "/get-all-categories",

  catchAsyncErrors(async (req, res, next) => {
    try {
      const categories = await Category.find().sort({ createdAt: -1 });

      res.status(201).json({
        success: true,
        categories,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get category by id
router.get(
  "/get-category/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const category = await Category.findById({ _id: req.params.id });

      res.status(201).json({
        success: true,
        category,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// all products --- for admin
router.get(
  "/admin-all-products",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update category picture
router.put(
  "/update-category-image/:id",
  isSeller,
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const categoryId = req.params.id;
      const existsCategory = await Category.findById(categoryId);

      const existImagePath = `uploads/${existsCategory.image}`;

      fs.unlinkSync(existImagePath);

      const fileUrl = path.join(req.file.filename);

      const category = await Category.findByIdAndUpdate(categoryId, {
        image: fileUrl,
      });

      res.status(200).json({
        success: true,
        category,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// router.put(
//   '/update-category-image/:id',
//   // isSeller,
//   upload.single('image'),
//   catchAsyncErrors(async (req, res, next) => {
//     try {
//       const categoryId = req.params.id;
//       const existsCategory = await Category.findById(categoryId);

//       if (existsCategory) {
//         const existImagePath = `uploads/${existsCategory.image}`;

//         fs.unlinkSync(existImagePath);
//       }

//       //const existImagePath = `uploads/${existsCategory.image}`;

//       //fs.unlinkSync(existImagePath);

//       const fileUrl = path.join(req.file.filename);

//       const category = await Category.findByIdAndUpdate(categoryId, {
//         image: fileUrl,
//       });

//       res.status(200).json({
//         success: true,
//         category,
//       });
//     } catch (error) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   })
// );
// update category
router.put(
  "/update-category-name/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    console.log("sent request during update inside route update");
    console.log(req.body);
    try {
      const categoryId = req.params.id;
      const { name } = req.body;
      const category = await Category.findById(categoryId);
      if (!category) {
        return next(new ErrorHandler("Category not found", 400));
      }

      category.name = name;
      await category.save();
      res.status(201).json({
        success: true,
        category,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
module.exports = router;
