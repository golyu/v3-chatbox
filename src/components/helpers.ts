import { IData } from "@/components/Data";
import faker from "minifaker";
import "minifaker/locales/en";

export const fetchDataApi = (count = 30) => {
  const result: IData[] = [];
  for (let i = 0; i < count; i++) {
    const item: IData = {
      timestamp: Date.now(),
      myKey: "",
      keyIndex: 0,
      translateY: 0,
      address: {
        city: faker.cityName(),
        street: faker.streetName(),
      },
      avatar: faker.imageUrlFromPlaceIMG({ width: 30, height: 30 }),
      dob: faker.date().toString(),
      email: faker.email(),
      img: {
        isDeffer: faker.boolean(),
        src: faker.imageUrlFromPlaceIMG({
          width: faker.number({ min: 20, max: 200 }),
          height: faker.number({ min: 20, max: 200 }),
        }),
        // src: `${import.meta.env.BASE_URL}images/${faker.number({ min: 1, max: 20 })}.jpeg`,
        width: faker.number({ min: 20, max: 200 }),
      },
      username: faker.username(),
      name: faker.name(),
      paragraph: faker.username(), //todo
      phone: faker.phoneNumber(),
    };
    result.push(item);
  }
  return result;
};
