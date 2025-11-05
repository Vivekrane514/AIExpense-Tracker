
"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { checkUser } from "@/lib/checkUser";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getAIInsights(accountId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await checkUser();
  if (!user) {
    throw new Error("User not found");
  }

  // Fetch budget, expenses, and income data for the account
  const budget = await db.budget.findFirst({
    where: { userId: user.id },
  });

  const currentDate = new Date();
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const expenses = await db.transaction.aggregate({
    where: {
      userId: user.id,
      type: "EXPENSE",
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      accountId,
    },
    _sum: {
      amount: true,
    },
  });

  const income = await db.transaction.aggregate({
    where: {
      userId: user.id,
      type: "INCOME",
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      accountId,
    },
    _sum: {
      amount: true,
    },
  });

  // Prepare prompt for Gemini API
  const prompt = `
  Provide financial advice based on the following data:
  Budget: ₹${budget ? budget.amount.toNumber() : 0}
  Expenses this month: ₹${expenses._sum.amount ? expenses._sum.amount.toNumber() : 0}
  Income this month: ₹${income._sum.amount ? income._sum.amount.toNumber() : 0}
  Please provide 4 to 5 concise points, each point 1 to 2 short sentences, with actionable insights to help manage finances better. Use ₹ symbol for all currency references.
  `;

  try {
    // Call Gemini API to get AI insights
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const advice = response.text() || "No insights available.";

    return advice;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Unable to generate AI insights at this time. Please try again later.";
  }
}


const serializeTracsaction = (obj) => {
    const serialized = { ...obj };

    if (obj.balance) {
        serialized.balance = obj.balance.toNumber();
    }

    if (obj.amount) {
        serialized.amount = obj.amount.toNumber();
    }

    return serialized; // Ensure the serialized object is returned
}

export async function createAccount(data) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');

        const user = await checkUser();

    if (!user) {
      throw new Error("User not found");
    }

    //convert balance to float before saving
    const balanceFloat = parseFloat(data.balance)
    if(isNaN(balanceFloat)){
        throw new Error("Invalid balance amount");
    }

    // Check if this is the user's first account
    const existingAccount = await db.account.findMany({
        where: { userId: user.id }
    })

    const shouldBeDefault = existingAccount.length===0?true:data.isDefault;

    //If the account should be default, unset other default accounts
    if(shouldBeDefault) {
        await db.account.updateMany({
            where: {userId: user.id, isDefault: true },
            data: { isDefault: false },
        })
    }

    const account = await db.account.create({
        data:{
            ...data,
            balance: balanceFloat,
            userId: user.id,
            isDefault: shouldBeDefault,
        },
    })

    const serializedAccount = serializeTracsaction (account);

    revalidatePath("/dashboard");
    return { success: true, data: serializedAccount };
    } catch (error) {
        throw new Error(error.message);
    }
    
}

export async function getUserAccounts() {
    const { userId } = await auth();
        if (!userId) throw new Error('Unauthorized');

        const user = await checkUser();

    if (!user) {
      throw new Error("User not found");
    }

    const accounts = await db.account.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: {
                    transactions: true,
                }
            }
        }
    })
    const serializedAccount = accounts.map(serializeTracsaction);

    return serializedAccount;
}

export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await checkUser();

  if (!user) {
    throw new Error("User not found");
  }

  // Get all user transactions
  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return transactions.map(serializeTracsaction);
}