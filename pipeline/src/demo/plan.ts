import type { FinalPlan } from "../domain/schemas.ts";

export const demoPlan: FinalPlan = {
  menu: {
    title: "Weekly Meal Plan",
    startsOn: "2026-07-28",
    days: [
      {
        date: "2026-07-28",
        dayName: "Tuesday",
        meals: [
          {
            type: "lunch",
            dish: "Grilled chicken Caesar wraps",
            description:
              "Grilled chicken, romaine, parmesan, and Caesar dressing wrapped in flour tortillas, served with carrot sticks.",
          },
          {
            type: "dinner",
            dish: "Lemon herb salmon with rice and green beans",
            description:
              "Baked salmon with lemon and dill, served over rice with steamed green beans.",
          },
        ],
      },
      {
        date: "2026-07-29",
        dayName: "Wednesday",
        meals: [
          {
            type: "lunch",
            dish: "Turkey and avocado grain bowls",
            description:
              "Sliced turkey, avocado, cherry tomatoes, cucumber, and brown rice with a light vinaigrette.",
          },
          {
            type: "dinner",
            dish: "Beef stir-fry with broccoli and jasmine rice",
            description:
              "Quick stir-fried beef with broccoli, bell peppers, and garlic-soy sauce over jasmine rice.",
          },
        ],
      },
      {
        date: "2026-07-30",
        dayName: "Thursday",
        meals: [
          {
            type: "lunch",
            dish: "Caprese pasta salad with grilled chicken",
            description:
              "Chilled pasta with tomatoes, mozzarella, basil, and grilled chicken tossed in a balsamic dressing.",
          },
          {
            type: "dinner",
            dish: "Chicken fajita tacos",
            description:
              "Seasoned chicken with sautéed peppers and onions in corn tortillas, topped with salsa and sour cream.",
          },
        ],
      },
      {
        date: "2026-07-31",
        dayName: "Friday",
        meals: [
          {
            type: "lunch",
            dish: "Tuna melt with tomato soup",
            description:
              "Open-faced tuna melts on toasted bread, served with a warm bowl of tomato soup.",
          },
          {
            type: "dinner",
            dish: "Pork tenderloin with roasted potatoes and asparagus",
            description:
              "Roasted pork tenderloin served with crispy potatoes and oven-roasted asparagus.",
          },
        ],
      },
      {
        date: "2026-08-01",
        dayName: "Saturday",
        meals: [
          {
            type: "lunch",
            dish: "Mediterranean chickpea pita pockets",
            description:
              "Pita stuffed with chickpeas, cucumber, tomato, red onion, and tzatziki.",
          },
          {
            type: "dinner",
            dish: "Shrimp scampi linguine",
            description:
              "Garlic shrimp tossed with linguine, lemon, parsley, and a light butter sauce.",
          },
        ],
      },
      {
        date: "2026-08-02",
        dayName: "Sunday",
        meals: [
          {
            type: "lunch",
            dish: "Mushroom and spinach quiche with side salad",
            description:
              "Savory quiche with mushrooms and spinach, served with mixed greens and vinaigrette.",
          },
          {
            type: "dinner",
            dish: "Homemade chicken curry with basmati rice",
            description:
              "Chicken simmered in a mild coconut curry sauce with peas, served over basmati rice.",
          },
        ],
      },
      {
        date: "2026-08-03",
        dayName: "Monday",
        meals: [
          {
            type: "lunch",
            dish: "Roast beef sandwich with coleslaw",
            description:
              "Roast beef on a crusty roll with lettuce, mustard, and a side of coleslaw.",
          },
          {
            type: "dinner",
            dish: "Vegetable lasagna with garlic bread",
            description:
              "Layers of pasta, ricotta, spinach, zucchini, and tomato sauce baked until bubbly, served with garlic bread.",
          },
        ],
      },
    ],
  },
  recipes: [
    {
      date: "2026-07-28",
      mealType: "lunch",
      dish: "Grilled chicken Caesar wraps",
      ingredients: [
        {
          name: "boneless skinless chicken breast",
          quantity: "1 medium (about 6 oz / 170 g)",
        },
        {
          name: "olive oil",
          quantity: "1 tablespoon",
        },
        {
          name: "garlic powder",
          quantity: "1/2 teaspoon",
        },
        {
          name: "salt",
          quantity: "1/4 teaspoon",
        },
        {
          name: "black pepper",
          quantity: "1/4 teaspoon",
        },
        {
          name: "romaine lettuce",
          quantity: "2 cups, chopped",
        },
        {
          name: "Parmesan cheese",
          quantity: "2 tablespoons, grated",
        },
        {
          name: "Caesar dressing",
          quantity: "2 tablespoons",
        },
        {
          name: "flour tortillas",
          quantity: "2 medium",
        },
        {
          name: "carrots",
          quantity: "1 medium, cut into sticks",
        },
      ],
      steps: [
        "Preheat a grill pan or skillet over medium-high heat.",
        "Pat the chicken dry. Rub with olive oil, garlic powder, salt, and pepper.",
        "Cook the chicken for 5 to 7 minutes per side, or until the center reaches 165°F (74°C). Let rest for 5 minutes, then slice thinly.",
        "In a bowl, toss romaine with Caesar dressing and Parmesan.",
        "Warm the tortillas briefly in a dry skillet or microwave so they are pliable.",
        "Divide the chicken and dressed lettuce between the tortillas, roll tightly, and slice if desired.",
        "Serve with carrot sticks on the side.",
      ],
    },
    {
      date: "2026-07-28",
      mealType: "dinner",
      dish: "Lemon herb salmon with rice and green beans",
      ingredients: [
        {
          name: "salmon fillet",
          quantity: "1 fillet (about 6 oz / 170 g)",
        },
        {
          name: "olive oil",
          quantity: "1 tablespoon",
        },
        {
          name: "lemon",
          quantity: "1/2, juiced and zested",
        },
        {
          name: "dried dill or fresh dill",
          quantity: "1 teaspoon dried or 1 tablespoon chopped fresh",
        },
        {
          name: "garlic powder",
          quantity: "1/4 teaspoon",
        },
        {
          name: "salt",
          quantity: "1/4 teaspoon",
        },
        {
          name: "black pepper",
          quantity: "1/4 teaspoon",
        },
        {
          name: "white rice",
          quantity: "1/2 cup uncooked",
        },
        {
          name: "water",
          quantity: "1 cup",
        },
        {
          name: "green beans",
          quantity: "1 cup, trimmed",
        },
        {
          name: "butter or olive oil",
          quantity: "1 teaspoon",
        },
        {
          name: "salt and pepper",
          quantity: "to taste",
        },
      ],
      steps: [
        "Preheat the oven to 400°F (200°C). Line a small baking tray with foil or parchment.",
        "Place the salmon on the tray. Drizzle with olive oil and lemon juice, then season with lemon zest, dill, garlic powder, salt, and pepper.",
        "Bake for 12 to 15 minutes, until the salmon flakes easily with a fork.",
        "Meanwhile, rinse the rice. Combine rice and water in a small saucepan, bring to a boil, then cover and reduce to low heat. Cook for about 15 minutes, or until tender. Rest 5 minutes and fluff with a fork.",
        "Steam the green beans until bright green and tender-crisp, about 4 to 5 minutes. Toss with butter or olive oil and a little salt and pepper.",
        "Serve the salmon over the rice with green beans on the side.",
      ],
    },
    {
      date: "2026-07-29",
      mealType: "lunch",
      dish: "Turkey and avocado grain bowls",
      ingredients: [
        {
          name: "brown rice",
          quantity: "1/2 cup uncooked",
        },
        {
          name: "water",
          quantity: "1 cup",
        },
        {
          name: "cooked turkey breast or deli turkey",
          quantity: "4 oz / 115 g, sliced",
        },
        {
          name: "avocado",
          quantity: "1/2, sliced",
        },
        {
          name: "cherry tomatoes",
          quantity: "1/2 cup, halved",
        },
        {
          name: "cucumber",
          quantity: "1/2 cup, diced",
        },
        {
          name: "mixed greens",
          quantity: "1 cup",
        },
        {
          name: "olive oil",
          quantity: "1 tablespoon",
        },
        {
          name: "lemon juice or vinegar",
          quantity: "1 teaspoon",
        },
        {
          name: "salt",
          quantity: "1/4 teaspoon",
        },
        {
          name: "black pepper",
          quantity: "1/4 teaspoon",
        },
      ],
      steps: [
        "Cook the brown rice according to package directions using the water. Let it cool slightly.",
        "In a small bowl, whisk together olive oil, lemon juice or vinegar, salt, and pepper to make a light vinaigrette.",
        "Arrange the rice in a bowl and top with turkey, avocado, tomatoes, cucumber, and mixed greens.",
        "Drizzle with the vinaigrette and gently toss just before eating.",
        "Taste and adjust seasoning as needed.",
      ],
    },
    {
      date: "2026-07-29",
      mealType: "dinner",
      dish: "Beef stir-fry with broccoli and jasmine rice",
      ingredients: [
        {
          name: "jasmine rice",
          quantity: "1/2 cup uncooked",
        },
        {
          name: "water",
          quantity: "1 cup",
        },
        {
          name: "beef sirloin or flank steak",
          quantity: "6 oz / 170 g, thinly sliced",
        },
        {
          name: "broccoli florets",
          quantity: "1 1/2 cups",
        },
        {
          name: "bell pepper",
          quantity: "1/2 medium, sliced",
        },
        {
          name: "garlic",
          quantity: "2 cloves, minced",
        },
        {
          name: "soy sauce",
          quantity: "1 1/2 tablespoons",
        },
        {
          name: "oyster sauce or hoisin sauce",
          quantity: "1 tablespoon",
        },
        {
          name: "cornstarch",
          quantity: "1 teaspoon",
        },
        {
          name: "water",
          quantity: "2 tablespoons",
        },
        {
          name: "vegetable oil",
          quantity: "1 tablespoon",
        },
        {
          name: "salt and pepper",
          quantity: "to taste",
        },
      ],
      steps: [
        "Cook the jasmine rice according to package directions. Set aside covered.",
        "In a small bowl, mix soy sauce, oyster sauce, cornstarch, and 2 tablespoons water. Stir until smooth.",
        "Heat a skillet or wok over high heat. Add the oil.",
        "Add the beef in a single layer and sear for 1 to 2 minutes per side until browned. Remove to a plate.",
        "Add broccoli and bell pepper to the pan with a splash of water. Stir-fry for 3 to 4 minutes until crisp-tender.",
        "Add garlic and cook for 30 seconds, then return the beef to the pan.",
        "Pour in the sauce and toss everything until glossy and thickened, about 1 minute.",
        "Serve immediately over jasmine rice.",
      ],
    },
    {
      date: "2026-07-30",
      mealType: "lunch",
      dish: "Caprese pasta salad with grilled chicken",
      ingredients: [
        {
          name: "short pasta such as rotini or penne",
          quantity: "2 oz / 55 g dry",
        },
        {
          name: "boneless skinless chicken breast",
          quantity: "1 medium (about 5 oz / 140 g)",
        },
        {
          name: "olive oil",
          quantity: "1 tablespoon",
        },
        {
          name: "salt",
          quantity: "1/4 teaspoon",
        },
        {
          name: "black pepper",
          quantity: "1/4 teaspoon",
        },
        {
          name: "cherry tomatoes",
          quantity: "1/2 cup, halved",
        },
        {
          name: "fresh mozzarella pearls or diced mozzarella",
          quantity: "1/3 cup",
        },
        {
          name: "fresh basil",
          quantity: "2 tablespoons, sliced",
        },
        {
          name: "balsamic vinegar",
          quantity: "1 tablespoon",
        },
        {
          name: "olive oil",
          quantity: "1 teaspoon",
        },
        {
          name: "honey or maple syrup",
          quantity: "1/2 teaspoon",
        },
        {
          name: "salt and pepper",
          quantity: "to taste",
        },
      ],
      steps: [
        "Bring a pot of salted water to a boil and cook the pasta until just tender. Drain and rinse under cool water to stop cooking.",
        "Season the chicken with olive oil, salt, and pepper. Grill in a grill pan or skillet over medium heat for 5 to 7 minutes per side, until cooked through. Rest, then slice.",
        "In a bowl, whisk balsamic vinegar, olive oil, honey, salt, and pepper.",
        "Combine the cooled pasta, tomatoes, mozzarella, basil, and sliced chicken.",
        "Toss with the dressing and chill for 10 minutes if desired before serving.",
      ],
    },
    {
      date: "2026-07-30",
      mealType: "dinner",
      dish: "Chicken fajita tacos",
      ingredients: [
        {
          name: "boneless skinless chicken breast",
          quantity: "1 medium (about 6 oz / 170 g), sliced",
        },
        {
          name: "bell pepper",
          quantity: "1 medium, sliced",
        },
        {
          name: "yellow onion",
          quantity: "1/2 medium, sliced",
        },
        {
          name: "olive oil",
          quantity: "1 tablespoon",
        },
        {
          name: "chili powder",
          quantity: "1 teaspoon",
        },
        {
          name: "ground cumin",
          quantity: "1/2 teaspoon",
        },
        {
          name: "garlic powder",
          quantity: "1/2 teaspoon",
        },
        {
          name: "salt",
          quantity: "1/4 teaspoon",
        },
        {
          name: "black pepper",
          quantity: "1/4 teaspoon",
        },
        {
          name: "corn tortillas",
          quantity: "4 small",
        },
        {
          name: "salsa",
          quantity: "2 tablespoons",
        },
        {
          name: "sour cream",
          quantity: "2 tablespoons",
        },
      ],
      steps: [
        "Toss the chicken with chili powder, cumin, garlic powder, salt, and pepper.",
        "Heat olive oil in a skillet over medium-high heat. Add the chicken and cook for 4 to 5 minutes, stirring occasionally, until nearly cooked through.",
        "Add the bell pepper and onion. Cook 4 to 5 minutes more until the vegetables are softened and the chicken is fully cooked.",
        "Warm the corn tortillas in a dry skillet or directly over a low flame for a few seconds per side.",
        "Fill the tortillas with the chicken and fajita vegetables. Top with salsa and sour cream.",
        "Serve immediately.",
      ],
    },
    {
      date: "2026-07-31",
      mealType: "lunch",
      dish: "Tuna melt with tomato soup",
      ingredients: [
        {
          name: "canned tuna",
          quantity: "1 can (5 oz / 140 g), drained",
        },
        {
          name: "mayonnaise",
          quantity: "1 tablespoon",
        },
        {
          name: "celery",
          quantity: "1 tablespoon, finely chopped",
        },
        {
          name: "lemon juice",
          quantity: "1 teaspoon",
        },
        {
          name: "salt and pepper",
          quantity: "to taste",
        },
        {
          name: "bread slices",
          quantity: "2 slices",
        },
        {
          name: "cheddar cheese",
          quantity: "2 slices",
        },
        {
          name: "butter",
          quantity: "1 teaspoon",
        },
        {
          name: "tomato soup",
          quantity: "1 1/2 cups",
        },
        {
          name: "milk or water",
          quantity: "1/4 cup, optional for thinning",
        },
      ],
      steps: [
        "Preheat the broiler or a toaster oven.",
        "Mix the tuna with mayonnaise, celery, lemon juice, salt, and pepper.",
        "Toast the bread lightly. Spread the tuna mixture over each slice and top with cheddar cheese.",
        "Broil for 1 to 3 minutes until the cheese is melted and bubbly. Watch closely so it does not burn.",
        "Warm the tomato soup in a saucepan, adding milk or water if you want a thinner consistency.",
        "Serve the tuna melts open-faced with the soup on the side.",
      ],
    },
    {
      date: "2026-07-31",
      mealType: "dinner",
      dish: "Pork tenderloin with roasted potatoes and asparagus",
      ingredients: [
        {
          name: "pork tenderloin",
          quantity: "1 small piece (about 6 oz / 170 g)",
        },
        {
          name: "olive oil",
          quantity: "1 1/2 tablespoons",
        },
        {
          name: "garlic powder",
          quantity: "1/2 teaspoon",
        },
        {
          name: "dried thyme or rosemary",
          quantity: "1/2 teaspoon",
        },
        {
          name: "salt",
          quantity: "1/2 teaspoon",
        },
        {
          name: "black pepper",
          quantity: "1/4 teaspoon",
        },
        {
          name: "potatoes",
          quantity: "1 medium, cut into 1-inch pieces",
        },
        {
          name: "asparagus",
          quantity: "1 cup, trimmed",
        },
        {
          name: "optional lemon wedge",
          quantity: "1 wedge",
        },
      ],
      steps: [
        "Preheat the oven to 425°F (220°C). Line a baking sheet with parchment or foil.",
        "Toss the potatoes with 1 tablespoon olive oil, half the salt, and a little pepper. Spread on the baking sheet and roast for 10 minutes.",
        "Rub the pork tenderloin with the remaining olive oil, garlic powder, thyme, remaining salt, and pepper.",
        "Push the potatoes to one side of the pan and add the pork. Roast for 15 to 20 minutes, or until the pork reaches 145°F (63°C) in the center.",
        "Add the asparagus to the pan for the last 8 to 10 minutes of cooking, tossing lightly with pan juices.",
        "Rest the pork for 5 minutes before slicing. Serve with potatoes and asparagus, plus lemon if desired.",
      ],
    },
    {
      date: "2026-08-01",
      mealType: "lunch",
      dish: "Mediterranean chickpea pita pockets",
      ingredients: [
        {
          name: "chickpeas",
          quantity: "1/2 cup canned, drained and rinsed",
        },
        {
          name: "cucumber",
          quantity: "1/2 cup, diced",
        },
        {
          name: "tomato",
          quantity: "1/2 medium, diced",
        },
        {
          name: "red onion",
          quantity: "2 tablespoons, thinly sliced",
        },
        {
          name: "tzatziki",
          quantity: "3 tablespoons",
        },
        {
          name: "lemon juice",
          quantity: "1 teaspoon",
        },
        {
          name: "olive oil",
          quantity: "1 teaspoon",
        },
        {
          name: "salt and pepper",
          quantity: "to taste",
        },
        {
          name: "pita bread",
          quantity: "1 large pita or 2 small pitas",
        },
        {
          name: "optional feta cheese",
          quantity: "1 tablespoon, crumbled",
        },
      ],
      steps: [
        "In a bowl, lightly mash about one-third of the chickpeas with a fork to help the filling hold together.",
        "Add the remaining chickpeas, cucumber, tomato, red onion, tzatziki, lemon juice, olive oil, salt, and pepper. Stir to combine.",
        "Warm the pita briefly in a dry skillet or microwave until soft.",
        "Cut open the pita pockets and fill with the chickpea mixture.",
        "Add feta if using and serve immediately.",
      ],
    },
    {
      date: "2026-08-01",
      mealType: "dinner",
      dish: "Shrimp scampi linguine",
      ingredients: [
        {
          name: "linguine",
          quantity: "2 oz / 55 g dry",
        },
        {
          name: "shrimp",
          quantity: "6 oz / 170 g, peeled and deveined",
        },
        {
          name: "butter",
          quantity: "1 tablespoon",
        },
        {
          name: "olive oil",
          quantity: "1 tablespoon",
        },
        {
          name: "garlic",
          quantity: "2 cloves, minced",
        },
        {
          name: "white wine or chicken broth",
          quantity: "1/4 cup",
        },
        {
          name: "lemon juice",
          quantity: "1 tablespoon",
        },
        {
          name: "lemon zest",
          quantity: "1/2 teaspoon",
        },
        {
          name: "red pepper flakes",
          quantity: "1 pinch",
        },
        {
          name: "parsley",
          quantity: "1 tablespoon, chopped",
        },
        {
          name: "salt and black pepper",
          quantity: "to taste",
        },
      ],
      steps: [
        "Bring a pot of salted water to a boil and cook the linguine until al dente. Reserve 1/4 cup pasta water, then drain.",
        "Pat the shrimp dry and season lightly with salt and pepper.",
        "Heat butter and olive oil in a skillet over medium heat. Add garlic and red pepper flakes and cook for 30 seconds.",
        "Add the shrimp and cook 1 to 2 minutes per side until pink and opaque.",
        "Pour in the wine or broth, lemon juice, and lemon zest. Simmer for 1 minute.",
        "Add the cooked linguine and toss to coat. Add a splash of reserved pasta water if needed to loosen the sauce.",
        "Finish with parsley and serve immediately.",
      ],
    },
    {
      date: "2026-08-02",
      mealType: "lunch",
      dish: "Mushroom and spinach quiche with side salad",
      ingredients: [
        {
          name: "pie crust",
          quantity: "1 single 9-inch crust",
        },
        {
          name: "mushrooms",
          quantity: "1 cup, sliced",
        },
        {
          name: "spinach",
          quantity: "1 cup, chopped",
        },
        {
          name: "olive oil or butter",
          quantity: "1 teaspoon",
        },
        {
          name: "eggs",
          quantity: "2 large",
        },
        {
          name: "milk or half-and-half",
          quantity: "1/2 cup",
        },
        {
          name: "salt",
          quantity: "1/4 teaspoon",
        },
        {
          name: "black pepper",
          quantity: "1/4 teaspoon",
        },
        {
          name: "nutmeg",
          quantity: "1 pinch",
        },
        {
          name: "shredded cheese",
          quantity: "1/4 cup",
        },
        {
          name: "mixed greens",
          quantity: "2 cups",
        },
        {
          name: "vinaigrette",
          quantity: "1 tablespoon",
        },
      ],
      steps: [
        "Preheat the oven to 375°F (190°C). Place the pie crust in a 9-inch pie plate and crimp the edges.",
        "Heat oil or butter in a skillet over medium heat. Cook the mushrooms for 4 to 5 minutes until browned, then add the spinach and cook until wilted. Let cool slightly.",
        "In a bowl, whisk the eggs, milk, salt, pepper, and nutmeg.",
        "Scatter the mushroom-spinach mixture and cheese into the crust. Pour the egg mixture over the top.",
        "Bake for 30 to 35 minutes, until the center is set and the top is lightly golden. Let rest 10 minutes before slicing.",
        "Toss the mixed greens with vinaigrette and serve alongside the quiche.",
      ],
    },
    {
      date: "2026-08-02",
      mealType: "dinner",
      dish: "Homemade chicken curry with basmati rice",
      ingredients: [
        {
          name: "basmati rice",
          quantity: "1/2 cup uncooked",
        },
        {
          name: "water",
          quantity: "1 cup",
        },
        {
          name: "boneless skinless chicken thighs or breast",
          quantity: "6 oz / 170 g, bite-sized pieces",
        },
        {
          name: "onion",
          quantity: "1/4 medium, finely chopped",
        },
        {
          name: "garlic",
          quantity: "2 cloves, minced",
        },
        {
          name: "ginger",
          quantity: "1 teaspoon, grated",
        },
        {
          name: "curry powder",
          quantity: "1 1/2 teaspoons",
        },
        {
          name: "olive oil",
          quantity: "1 tablespoon",
        },
        {
          name: "coconut milk",
          quantity: "1/2 cup",
        },
        {
          name: "chicken broth or water",
          quantity: "1/4 cup",
        },
        {
          name: "peas",
          quantity: "1/3 cup",
        },
        {
          name: "salt",
          quantity: "1/4 teaspoon",
        },
        {
          name: "black pepper",
          quantity: "1/4 teaspoon",
        },
        {
          name: "cilantro, optional",
          quantity: "1 tablespoon, chopped",
        },
      ],
      steps: [
        "Cook the basmati rice according to package directions and keep warm.",
        "Heat olive oil in a saucepan over medium heat. Add onion and cook for 2 to 3 minutes until softened.",
        "Add garlic, ginger, and curry powder. Stir for 30 seconds until fragrant.",
        "Add the chicken pieces and cook, stirring, until lightly browned on all sides.",
        "Pour in the coconut milk and broth or water. Bring to a gentle simmer and cook for 10 to 12 minutes, until the chicken is cooked through.",
        "Stir in the peas and cook for 2 minutes more. Season with salt and pepper.",
        "Serve the curry over basmati rice and garnish with cilantro if desired.",
      ],
    },
    {
      date: "2026-08-03",
      mealType: "lunch",
      dish: "Roast beef sandwich with coleslaw",
      ingredients: [
        {
          name: "crusty roll or sandwich bread",
          quantity: "1 roll or 2 slices",
        },
        {
          name: "roast beef",
          quantity: "4 oz / 115 g, sliced",
        },
        {
          name: "lettuce",
          quantity: "1 leaf",
        },
        {
          name: "mustard",
          quantity: "1 tablespoon",
        },
        {
          name: "coleslaw mix",
          quantity: "1 cup",
        },
        {
          name: "mayonnaise",
          quantity: "1 tablespoon",
        },
        {
          name: "apple cider vinegar",
          quantity: "1 teaspoon",
        },
        {
          name: "salt and pepper",
          quantity: "to taste",
        },
      ],
      steps: [
        "In a small bowl, mix the coleslaw mix with mayonnaise, vinegar, salt, and pepper. Set aside to soften slightly.",
        "Slice the roll if needed and spread mustard on the bread.",
        "Layer the roast beef and lettuce onto the sandwich.",
        "Serve with the coleslaw on the side or tucked into the sandwich.",
        "Eat immediately for best texture.",
      ],
    },
    {
      date: "2026-08-03",
      mealType: "dinner",
      dish: "Vegetable lasagna with garlic bread",
      ingredients: [
        {
          name: "lasagna noodles",
          quantity: "4 noodles",
        },
        {
          name: "ricotta cheese",
          quantity: "1/2 cup",
        },
        {
          name: "egg",
          quantity: "1",
        },
        {
          name: "spinach",
          quantity: "1 cup, chopped",
        },
        {
          name: "zucchini",
          quantity: "1/2 medium, diced",
        },
        {
          name: "tomato sauce",
          quantity: "1 cup",
        },
        {
          name: "mozzarella cheese",
          quantity: "1/2 cup, shredded",
        },
        {
          name: "Parmesan cheese",
          quantity: "2 tablespoons, grated",
        },
        {
          name: "olive oil",
          quantity: "1 teaspoon",
        },
        {
          name: "garlic bread",
          quantity: "1 small serving (1 to 2 slices)",
        },
        {
          name: "salt and pepper",
          quantity: "to taste",
        },
      ],
      steps: [
        "Preheat the oven to 375°F (190°C). Grease a small baking dish.",
        "Cook the lasagna noodles according to package directions. Drain and lay flat.",
        "In a skillet, heat olive oil over medium heat. Cook the zucchini for 3 to 4 minutes, then add spinach and cook until wilted. Season lightly with salt and pepper.",
        "Mix ricotta with the egg and a pinch of salt and pepper.",
        "Spread a thin layer of tomato sauce in the bottom of the baking dish. Add a layer of noodles, ricotta mixture, vegetables, sauce, and mozzarella. Repeat until ingredients are used, finishing with sauce, mozzarella, and Parmesan on top.",
        "Bake for 30 to 35 minutes until bubbly and browned on top. Let rest 10 minutes before serving.",
        "Warm the garlic bread according to package directions or toast bread with butter and garlic. Serve alongside the lasagna.",
      ],
    },
  ],
  shoppingList: [
    {
      section: "Produce",
      items: [
        {
          name: "romaine lettuce",
          quantity: "2 cups, chopped",
        },
        {
          name: "carrots",
          quantity: "1 medium",
        },
        {
          name: "lemon",
          quantity: "2 medium",
        },
        {
          name: "avocado",
          quantity: "1/2",
        },
        {
          name: "cherry tomatoes",
          quantity: "1 cup",
        },
        {
          name: "cucumber",
          quantity: "1 cup",
        },
        {
          name: "mixed greens",
          quantity: "3 cups",
        },
        {
          name: "broccoli florets",
          quantity: "1 1/2 cups",
        },
        {
          name: "bell pepper",
          quantity: "1 1/2 medium",
        },
        {
          name: "fresh basil",
          quantity: "2 tablespoons",
        },
        {
          name: "yellow onion",
          quantity: "1/2 medium",
        },
        {
          name: "celery",
          quantity: "1 tablespoon chopped",
        },
        {
          name: "potatoes",
          quantity: "1 medium",
        },
        {
          name: "asparagus",
          quantity: "1 cup",
        },
        {
          name: "tomato",
          quantity: "1/2 medium",
        },
        {
          name: "red onion",
          quantity: "2 tablespoons",
        },
        {
          name: "mushrooms",
          quantity: "1 cup",
        },
        {
          name: "spinach",
          quantity: "2 cups, chopped",
        },
        {
          name: "ginger",
          quantity: "1 teaspoon",
        },
        {
          name: "peas",
          quantity: "1/3 cup",
        },
        {
          name: "onion",
          quantity: "1/4 medium",
        },
        {
          name: "zucchini",
          quantity: "1/2 medium",
        },
        {
          name: "lettuce",
          quantity: "1 leaf",
        },
        {
          name: "garlic",
          quantity: "6 cloves",
        },
        {
          name: "parsley",
          quantity: "1 tablespoon",
        },
        {
          name: "dill",
          quantity: "1 teaspoon dried or 1 tablespoon fresh",
        },
        {
          name: "cilantro",
          quantity: "1 tablespoon, optional",
        },
      ],
    },
    {
      section: "Meat & Seafood",
      items: [
        {
          name: "boneless skinless chicken breast",
          quantity: "3 medium breasts (about 16 oz / 480 g total)",
        },
        {
          name: "salmon fillet",
          quantity: "1 fillet (about 6 oz / 170 g)",
        },
        {
          name: "cooked turkey breast or deli turkey",
          quantity: "4 oz / 115 g",
        },
        {
          name: "beef sirloin or flank steak",
          quantity: "6 oz / 170 g",
        },
        {
          name: "canned tuna",
          quantity: "1 can (5 oz / 140 g)",
        },
        {
          name: "pork tenderloin",
          quantity: "1 small piece (about 6 oz / 170 g)",
        },
        {
          name: "shrimp",
          quantity: "6 oz / 170 g",
        },
        {
          name: "boneless skinless chicken thighs or breast",
          quantity: "6 oz / 170 g",
        },
        {
          name: "roast beef",
          quantity: "4 oz / 115 g",
        },
      ],
    },
    {
      section: "Dairy & Eggs",
      items: [
        {
          name: "Parmesan cheese",
          quantity: "4 tablespoons, grated",
        },
        {
          name: "fresh mozzarella pearls or diced mozzarella",
          quantity: "1/3 cup",
        },
        {
          name: "sour cream",
          quantity: "2 tablespoons",
        },
        {
          name: "cheddar cheese",
          quantity: "2 slices",
        },
        {
          name: "butter",
          quantity: "1 tablespoon",
        },
        {
          name: "milk or water",
          quantity: "1/4 cup, optional",
        },
        {
          name: "tzatziki",
          quantity: "3 tablespoons",
        },
        {
          name: "eggs",
          quantity: "3 large",
        },
        {
          name: "milk or half-and-half",
          quantity: "1/2 cup",
        },
        {
          name: "shredded cheese",
          quantity: "1/4 cup",
        },
        {
          name: "coconut milk",
          quantity: "1/2 cup",
        },
        {
          name: "ricotta cheese",
          quantity: "1/2 cup",
        },
        {
          name: "mozzarella cheese",
          quantity: "1/2 cup, shredded",
        },
        {
          name: "Caesar dressing",
          quantity: "2 tablespoons",
        },
        {
          name: "vinaigrette",
          quantity: "1 tablespoon",
        },
      ],
    },
    {
      section: "Bakery & Grains",
      items: [
        {
          name: "flour tortillas",
          quantity: "2 medium",
        },
        {
          name: "white rice",
          quantity: "1/2 cup uncooked",
        },
        {
          name: "brown rice",
          quantity: "1/2 cup uncooked",
        },
        {
          name: "jasmine rice",
          quantity: "1/2 cup uncooked",
        },
        {
          name: "short pasta such as rotini or penne",
          quantity: "2 oz / 55 g dry",
        },
        {
          name: "corn tortillas",
          quantity: "4 small",
        },
        {
          name: "bread slices",
          quantity: "2 slices",
        },
        {
          name: "pita bread",
          quantity: "1 large pita or 2 small pitas",
        },
        {
          name: "linguine",
          quantity: "2 oz / 55 g dry",
        },
        {
          name: "pie crust",
          quantity: "1 single 9-inch crust",
        },
        {
          name: "basmati rice",
          quantity: "1/2 cup uncooked",
        },
        {
          name: "crusty roll or sandwich bread",
          quantity: "1 roll or 2 slices",
        },
        {
          name: "lasagna noodles",
          quantity: "4 noodles",
        },
        {
          name: "garlic bread",
          quantity: "1 small serving",
        },
      ],
    },
    {
      section: "Pantry & Condiments",
      items: [
        {
          name: "olive oil",
          quantity: "11 1/2 tablespoons",
        },
        {
          name: "garlic powder",
          quantity: "1 3/4 teaspoons",
        },
        {
          name: "salt",
          quantity: "2 teaspoons",
        },
        {
          name: "black pepper",
          quantity: "2 teaspoons",
        },
        {
          name: "water",
          quantity: "3 cups plus 2 tablespoons",
        },
        {
          name: "soy sauce",
          quantity: "1 1/2 tablespoons",
        },
        {
          name: "oyster sauce or hoisin sauce",
          quantity: "1 tablespoon",
        },
        {
          name: "cornstarch",
          quantity: "1 teaspoon",
        },
        {
          name: "vegetable oil",
          quantity: "1 tablespoon",
        },
        {
          name: "balsamic vinegar",
          quantity: "1 tablespoon",
        },
        {
          name: "honey or maple syrup",
          quantity: "1/2 teaspoon",
        },
        {
          name: "chili powder",
          quantity: "1 teaspoon",
        },
        {
          name: "ground cumin",
          quantity: "1/2 teaspoon",
        },
        {
          name: "salsa",
          quantity: "2 tablespoons",
        },
        {
          name: "mayonnaise",
          quantity: "2 tablespoons",
        },
        {
          name: "tomato soup",
          quantity: "1 1/2 cups",
        },
        {
          name: "dried thyme or rosemary",
          quantity: "1/2 teaspoon",
        },
        {
          name: "chickpeas",
          quantity: "1/2 cup canned, drained and rinsed",
        },
        {
          name: "white wine or chicken broth",
          quantity: "1/4 cup",
        },
        {
          name: "red pepper flakes",
          quantity: "1 pinch",
        },
        {
          name: "nutmeg",
          quantity: "1 pinch",
        },
        {
          name: "curry powder",
          quantity: "1 1/2 teaspoons",
        },
        {
          name: "mustard",
          quantity: "1 tablespoon",
        },
        {
          name: "coleslaw mix",
          quantity: "1 cup",
        },
        {
          name: "apple cider vinegar",
          quantity: "1 teaspoon",
        },
        {
          name: "tomato sauce",
          quantity: "1 cup",
        },
        {
          name: "Caesar dressing",
          quantity: "2 tablespoons",
        },
      ],
    },
  ],
};
