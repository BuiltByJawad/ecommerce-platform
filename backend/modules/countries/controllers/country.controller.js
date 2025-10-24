import db from "../../../config/database.config.js";
import errorResponse from "../../../utils/errorResponse.js";
import successResponse from "../../../utils/successResponse.js";

const Country = db.model.Country;

export const getCountries = async (req, res) => {
  try {
    const countries = await Country.find({});

    successResponse(
      200,
      "SUCCESS",
      {
        countries,
      },
      res
    );
  } catch (err) {
    errorResponse(
      500,
      "ERROR",
      err.message || "Some error occurred while getting the countries",
      res
    );
  }
};
