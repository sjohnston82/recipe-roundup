import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Delete existing data for a clean seed (optional)
  await prisma.recipe.deleteMany();
  await prisma.user.deleteMany();

  // Create 4 users, each with 1 recipe
  await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice",
      password: "password123",
      emailVerified: true,
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
      Recipe: {
        create: [
          {
            title: "Classic Pancakes",
            cuisine: "American",
            sourceUrl: "https://example.com/pancakes",
            description: "Fluffy, delicious pancakes for breakfast.",
            ingredients: [
              "2 cups flour",
              "2 eggs",
              "1 1/2 cups milk",
              "2 tbsp sugar",
              "1 tbsp baking powder",
              "Pinch of salt",
            ],
            instructions: [
              "Mix dry ingredients.",
              "Add eggs and milk, whisk until smooth.",
              "Pour batter onto hot griddle.",
              "Cook until bubbles form, flip and finish.",
            ],
            prepTime: "10",
            cookTime: "15",
            servings: "4",
            category: ["Breakfast", "Vegetarian"],
          },
        ],
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "bob@example.com",
      name: "Bob",
      password: "password456",
      emailVerified: false,
      image: "https://randomuser.me/api/portraits/men/2.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
      Recipe: {
        create: [
          {
            title: "Spaghetti Carbonara",
            cuisine: "Italian",
            sourceUrl: "https://example.com/carbonara",
            description: "A creamy Italian pasta dish.",
            ingredients: [
              "200g spaghetti",
              "100g pancetta",
              "2 eggs",
              "50g parmesan cheese",
              "Salt",
              "Pepper",
            ],
            instructions: [
              "Cook spaghetti.",
              "Fry pancetta.",
              "Mix eggs and cheese.",
              "Combine all with pasta.",
              "Season and serve.",
            ],
            prepTime: "15",
            cookTime: "20",
            servings: "2",
            category: ["Dinner", "Pasta"],
          },
        ],
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "carol@example.com",
      name: "Carol",
      password: "password789",
      emailVerified: true,
      image: "https://randomuser.me/api/portraits/women/3.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
      Recipe: {
        create: [
          {
            title: "Vegan Buddha Bowl",
            cuisine: "Fusion",
            sourceUrl: "https://example.com/buddha-bowl",
            description: "A nutritious vegan bowl.",
            ingredients: [
              "1 cup quinoa",
              "1 avocado",
              "1 cup chickpeas",
              "Mixed veggies",
              "Tahini sauce",
            ],
            instructions: [
              "Cook quinoa.",
              "Prepare veggies.",
              "Assemble bowl.",
              "Drizzle with tahini sauce.",
            ],
            prepTime: "20",
            cookTime: "15",
            servings: "1",
            category: ["Lunch", "Vegan"],
          },
        ],
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "dan@example.com",
      name: "Dan",
      password: "password321",
      emailVerified: false,
      image: "https://randomuser.me/api/portraits/men/4.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
      Recipe: {
        create: [
          {
            title: "Chicken Tikka Masala",
            cuisine: "Indian",
            sourceUrl: "https://example.com/tikka-masala",
            description: "A flavorful Indian curry.",
            ingredients: [
              "500g chicken",
              "1 cup yogurt",
              "Spices",
              "Tomato sauce",
              "Cream",
            ],
            instructions: [
              "Marinate chicken.",
              "Cook chicken.",
              "Prepare sauce.",
              "Combine and simmer.",
            ],
            prepTime: "30",
            cookTime: "40",
            servings: "4",
            category: ["Dinner", "Curry"],
          },
        ],
      },
    },
  });
}

main()
  .then(() => {
    console.log("Seed successful!");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
