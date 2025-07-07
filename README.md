# 💰 Personal Finance Tracker

A simple, elegant web application to track your personal finances, visualize spending habits, manage budgets, and gain insights — built using **Next.js**, **React**, **Tailwind (shadcn/ui)**, **Recharts**, and **MongoDB**.

> 🚀 Deployed on: [https://finance-tracker.vercel.app](https://finance-tracker.vercel.app)  
> 👩‍💻 Built by: [Jalla Sudarshan Reddy](https://github.com/sudarshanJ18)

---

## 📸 Features

- ✅ Add / Edit / Delete transactions
- 📊 Monthly Expenses Bar Chart
- 📂 Predefined & Custom Categories
- 📅 Budget Setting and Comparison
- 🔍 Spending Insights via Pie Charts
- 🌐 Fully responsive, clean UI with error states

---

## 🧰 Tech Stack

| Tech            | Description                                     |
|-----------------|-------------------------------------------------|
| Next.js         | Full-stack React framework (App Router)         |
| React           | Frontend component architecture                 |
| MongoDB Atlas   | NoSQL database for storing transactions         |
| Tailwind CSS    | Utility-first CSS with `shadcn/ui` components   |
| Recharts        | Visualization for insights & budget charts      |
| TypeScript      | Type safety throughout the codebase             |

---

## 📦 Folder Structure

/app
└── api # API routes (REST endpoints)
└── dashboard # Dashboard and insights
/components # Reusable UI components
/lib # DB connection & utilities
/public # Static assets
/types # Shared TypeScript types
.env.local # Environment variables


---

## 🚀 Getting Started (Local Dev)


### 1. Clone the Repository

```bash
git clone https://github.com/sudarshanJ18/finance-tracker.git
cd finance-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Environment Variables

Create a `.env.local` file in the root of the project and add your MongoDB connection string:

```bashenv
MONGODB_URI="your_mongodb_connection_string"
```

### 4. Start the Server

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to see the application in action.

---

## 📝 Contributing  

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to contribute to this project.


