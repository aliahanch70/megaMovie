import { title } from "node:process";

export const translations = {
  en: {
    nav: {
      store: 'Store',
      home: 'Home',
      shop: 'Shop',
      dashboard: 'Dashboard',
      admin: 'Admin',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
      languageSwitch: 'فارسی',
    },
    settings: {
      title: 'Account Settings',
      name: 'Name',
      email: 'Email',
      password: 'Password',
      sendCode: 'Send Verification Code',
      saveChanges: 'Save Changes',
      // ... add more translations
    },
    admin:{
      title: 'Admin Dashboard', 
      productManagement: 'Product Management',
      productSettings: 'Product Settings',
      manageProducts: 'Manage Products',
      addNewProduct: 'Add New Product',
      productCount: 'Products',
    },
    product: {
      addToCart: 'Add to Cart',
      quantity: 'Quantity',
      description: 'Description',
      specifications: 'Specifications',
      reviews: 'Reviews',
      relatedProducts: 'Related Products',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock'
    },
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      signUp: 'Sign Up',
      signIn: 'Sign In',
      resetPassword: 'Reset Password'
    },
    messages: {
      invalidCredentials: 'Invalid email or password',
      registrationSuccess: 'Registration successful',
      passwordMismatch: 'Passwords do not match',
      requiredField: 'This field is required'
    }
  },
  fa: {
    nav: {
      store: 'فروشگاه',
      home: 'خانه',
      shop: 'فروشگاه',
      dashboard: 'داشبورد',
      admin: 'مدیریت',
      profile: 'پروفایل',
      settings: 'تنظیمات',
      logout: 'خروج',
      languageSwitch: 'English',
    },
    settings: {
      title: 'تنظیمات حساب',
      name: 'نام',
      email: 'ایمیل',
      password: 'رمز عبور',
      sendCode: 'ارسال کد تایید',
      saveChanges: 'ذخیره تغییرات',
      // ... add more translations
    },
    product: {
      addToCart: 'افزودن به سبد خرید',
      quantity: 'تعداد',
      description: 'توضیحات',
      specifications: 'مشخصات',
      reviews: 'نظرات',
      relatedProducts: 'محصولات مرتبط',
      inStock: 'موجود',
      outOfStock: 'ناموجود'
    },
    admin:{
      title: 'داشبورد مدیریت', 
      productManagement: 'مدیریت محصولات',
      productSettings: 'تنظیمات محصولات',
      manageProducts: 'مدیریت محصولات',
      addNewProduct: 'اضافه کردن محصول جدید',
      productCount: 'محصول',
    },
    auth: {
      login: 'ورود',
      register: 'ثبت نام',
      email: 'ایمیل',
      password: 'رمز عبور',
      confirmPassword: 'تایید رمز عبور',
      forgotPassword: 'رمز عبور را فراموش کرده‌اید؟',
      rememberMe: 'مرا به خاطر بسپار',
      dontHaveAccount: 'حساب کاربری ندارید؟',
      alreadyHaveAccount: 'قبلاً حساب کاربری دارید؟',
      signUp: 'ثبت نام',
      signIn: 'ورود',
      resetPassword: 'بازیابی رمز عبور'
    },
    messages: {
      invalidCredentials: 'ایمیل یا رمز عبور نامعتبر است',
      registrationSuccess: 'ثبت نام با موفقیت انجام شد',
      passwordMismatch: 'رمز عبور و تایید آن مطابقت ندارند',
      requiredField: 'این فیلد الزامی است'
    }
  }
};
