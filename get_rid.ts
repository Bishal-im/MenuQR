import { getRestaurants } from "./src/services/superAdminService";

async function main() {
    try {
        const restaurants = await getRestaurants();
        console.log("RESTAURANTS:", JSON.stringify(restaurants, null, 2));
    } catch (e) {
        console.error(e);
    }
}

main();
