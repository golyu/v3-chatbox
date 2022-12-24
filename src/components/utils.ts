import _ from "lodash-es";

export const getUUID = () => {
  return URL.createObjectURL(new Blob()).substr(-36);
};

const prefix = getUUID() + "_";
export const uniqueId = () => {
  return _.uniqueId(prefix);
};
