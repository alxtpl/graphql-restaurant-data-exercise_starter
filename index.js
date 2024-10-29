var { graphqlHTTP } = require("express-graphql");
var { buildSchema } = require("graphql");
var express = require("express");

var restaurants = [
  {
    id: 1,
    name: "WoodsHill",
    description: "American cuisine, farm to table, with fresh produce every day",
    dishes: [
      { name: "Swordfish grill", price: 27 },
      { name: "Roasted Broccoli", price: 11 },
    ],
  },
  {
    id: 2,
    name: "Fiorellas",
    description: "Italian-American home cooked food with fresh pasta and sauces",
    dishes: [
      { name: "Flatbread", price: 14 },
      { name: "Carbonara", price: 18 },
      { name: "Spaghetti", price: 19 },
    ],
  },
  {
    id: 3,
    name: "Karma",
    description: "Malaysian-Chinese-Japanese fusion, with great bar and bartenders",
    dishes: [
      { name: "Dragon Roll", price: 12 },
      { name: "Pancake roll", price: 11 },
      { name: "Cod cakes", price: 13 },
    ],
  },
];

// GraphQL schema
var schema = buildSchema(`
  type Query {
    restaurant(id: Int!): Restaurant
    restaurants: [Restaurant]
  }

  type Restaurant {
    id: Int
    name: String
    description: String
    dishes: [Dish]
  }

  type Dish {
    name: String
    price: Int
  }

  input RestaurantInput {
    name: String
    description: String
  }

  type DeleteResponse {
    ok: Boolean!
  }

  type Mutation {
    setrestaurant(input: RestaurantInput): Restaurant
    deleterestaurant(id: Int!): DeleteResponse
    editrestaurant(id: Int!, name: String, description: String): Restaurant
  }
`);

// Root resolver
var root = {
  restaurant: ({ id }) => restaurants.find((r) => r.id === id),
  restaurants: () => restaurants,
  
  setrestaurant: ({ input }) => {
    const newRestaurant = {
      id: restaurants.length + 1,
      name: input.name,
      description: input.description,
      dishes: [],
    };
    restaurants.push(newRestaurant);
    return newRestaurant;
  },
  
  deleterestaurant: ({ id }) => {
    const restaurantIndex = restaurants.findIndex((r) => r.id === id);
    const exists = restaurantIndex !== -1;
    if (exists) {
      restaurants.splice(restaurantIndex, 1);
    }
    return { ok: exists };
  },

  editrestaurant: ({ id, name, description }) => {
    const restaurant = restaurants.find((r) => r.id === id);
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }
    if (name) restaurant.name = name;
    if (description) restaurant.description = description;
    return restaurant;
  },
};

var app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

app.listen(5500, () => console.log("Running GraphQL server at http://localhost:5500/graphql"));
