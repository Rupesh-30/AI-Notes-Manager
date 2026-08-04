import React, { createContext, useContext, useState } from "react";



const translations = {

  en: {

    settings: "Settings",

    displaySize: "Display Size",

    small: "Small",

    medium: "Medium",

    large: "Large",



    language: "Language",

    english: "English",

    bengali: "বাংলা",



    about: "About",

    appName: "AI Notes Manager",

    builtWith: "Built with React + Gemini AI",

    close: "Close",



    login: "Login",

    signup: "Sign Up",

    logout: "Logout",

    email: "Email Address",

    password: "Password",



    welcomeBack: "Welcome Back 👋",

    loginSubtitle: "Login to your AI Notes Manager",

    createAccount: "Create a new account →",

    backToLogin: "← Back to Login",

    creatingAccount: "Creating Account...",

    loggingIn: "Logging in...",



    search: "Search notes...",

    newNote: "New Note",

    noNotes: "No notes found",

    save: "Save",

    saved: "Saved",



    askAI: "Ask AI",

    summarize: "Summarize",

    grammar: "Grammar",

    tasks: "Tasks",

    translate: "Translate",

    rewrite: "Rewrite",



    profile: "Profile",

    theme: "Theme",

    dark: "Dark",

    light: "Light",



    accountCreated: "Account created successfully!",

    loginSuccessful: "Login successful!",

    loginFailed: "Login failed. Check your email and password.",

    fillFields: "Please fill in all fields",

    emailExists: "This email is already registered. Please login.",

  },



  bn: {

    settings: "সেটিংস",

    displaySize: "ডিসপ্লে সাইজ",

    small: "ছোট",

    medium: "মাঝারি",

    large: "বড়",



    language: "ভাষা",

    english: "ইংরেজি",

    bengali: "বাংলা",



    about: "সম্পর্কে",

    appName: "AI নোট ম্যানেজার",

    builtWith: "React + Gemini AI দিয়ে তৈরি",

    close: "বন্ধ করুন",



    login: "লগইন",

    signup: "সাইন আপ",

    logout: "লগআউট",

    email: "ইমেইল ঠিকানা",

    password: "পাসওয়ার্ড",



    welcomeBack: "আবারও স্বাগতম 👋",

    loginSubtitle: "আপনার AI Notes Manager-এ লগইন করুন",

    createAccount: "নতুন অ্যাকাউন্ট তৈরি করুন →",

    backToLogin: "← লগইনে ফিরে যান",

    creatingAccount: "অ্যাকাউন্ট তৈরি হচ্ছে...",

    loggingIn: "লগইন হচ্ছে...",



    search: "নোট খুঁজুন...",

    newNote: "নতুন নোট",

    noNotes: "কোনো নোট পাওয়া যায়নি",

    save: "সংরক্ষণ করুন",

    saved: "সংরক্ষিত",



    askAI: "AI-কে জিজ্ঞাসা করুন",

    summarize: "সারসংক্ষেপ",

    grammar: "ব্যাকরণ",

    tasks: "কাজ",

    translate: "অনুবাদ",

    rewrite: "পুনরায় লিখুন",



    profile: "প্রোফাইল",

    theme: "থিম",

    dark: "ডার্ক",

    light: "লাইট",



    accountCreated: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!",

    loginSuccessful: "লগইন সফল হয়েছে!",

    loginFailed: "লগইন ব্যর্থ হয়েছে। ইমেইল ও পাসওয়ার্ড পরীক্ষা করুন।",

    fillFields: "সবগুলো ঘর পূরণ করুন",

    emailExists: "এই ইমেইল ইতিমধ্যেই নিবন্ধিত। অনুগ্রহ করে লগইন করুন।",

  },

};



export const LanguageContext = createContext(null);



export function LanguageProvider({ children }) {

  const [language, setLanguageState] = useState(

    () => localStorage.getItem("language") || "en"

  );



  const setLanguage = (value) => {

    setLanguageState(value);

    localStorage.setItem("language", value);

  };



  const t = translations[language] || translations.en;



  return (

    <LanguageContext.Provider

      value={{

        language,

        setLanguage,

        t,

      }}

    >

      {children}

    </LanguageContext.Provider>

  );

}



export function useLanguage() {

  const context = useContext(LanguageContext);



  if (!context) {

    throw new Error(

      "useLanguage must be used inside LanguageProvider"

    );

  }



  return context;

}