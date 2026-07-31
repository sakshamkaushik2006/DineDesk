import oysters from "@/assets/dish-oysters.jpg";
import scallops from "@/assets/dish-scallops.jpg";
import steak from "@/assets/dish-steak.jpg";
import pasta from "@/assets/dish-pasta.jpg";
import dessert from "@/assets/dish-dessert.jpg";
import cocktail from "@/assets/dish-cocktail.jpg";

export const MENU_IMAGES: Record<string, string> = {
  "Kumamoto Oysters": oysters,
  "Seared Hokkaido Scallops": scallops,
  "A5 Wagyu Ribeye": steak,
  "Black Truffle Tagliatelle": pasta,
  "Molten Chocolate & Gold": dessert,
  "Smoked Old Fashioned": cocktail,
};

export function getMenuImage(name: string): string | undefined {
  return MENU_IMAGES[name];
}
