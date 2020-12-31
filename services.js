const axios = require("axios").default;
const util = require("./util");
const {
  GOOGLE_MAP_AUTOCOMPLETE_API,
  GOOGLE_MAP_PLACE_API,
  GOOGLE_API_KEY,
} = require("./config");

module.exports.formatVietnameseAddress = async (input, datas) => {
  const addressInputExtracted = extractAddressInputData(input);
  const placeFromAPI = await fetchPlaceFromGoogleMapsApi(
    input,
    addressInputExtracted
  );

  if (!placeFromAPI) {
    return input;
  }

  const matchAddress = datas.reduce(
    (result, data) => {
      const matchAdr = placeFromAPI.keys.filter((e) => {
        return data.keys.indexOf(e) !== -1;
      });

      if (
        (!result.address && matchAdr.length > 0) ||
        matchAdr.length > result.match_length
      ) {
        result.address = data;
        result.match_length = matchAdr.length;
      }

      return result;
    },
    { address: undefined, match_length: 0 }
  );

  if (matchAddress.match_length > 2) {
    const address = matchAddress.address.value;
    let streetValue = getStreetFromInputOriginal(input, address);

    streetValue = streetValue.replace(/[./\-,]$/, "");

    return streetValue ? `${streetValue}, ${address}` : address;
  }

  return input;
};

async function fetchPlaceFromGoogleMapsApi(input, addressInputExtracted) {
  let formatted_address;

  const inputQuery = input
    .toLowerCase()
    .replace(/^(ấp|hẻm|xóm|xom|ap|hem)/g, "")
    .trim();

  const placeResponse = await fetchAddressFromGoogleAutocompleteApi(inputQuery);

  if (placeResponse.length) {
    const placeResponseMatched = placeResponse.reduce(
      (result, data) => {
        const placeResponseExtracted = extractAddressInputData(
          data.description
        );

        const mainTextExtracted = extractAddressInputData(
          data.structured_formatting.main_text
        );

        const matchAdr = addressInputExtracted.keys.filter((e) => {
          return placeResponseExtracted.keys.indexOf(e) !== -1;
        });

        const matchMainText = addressInputExtracted.keys.filter((e) => {
          return mainTextExtracted.keys.indexOf(e) !== -1;
        });

        if (
          !result.address ||
          (matchAdr.length > result.match_length && matchMainText.length >= 2)
        ) {
          result.address = placeResponseExtracted;
          result.match_length = matchAdr.length;
          result.main_match_length = matchMainText.length;
        }

        return result;
      },
      { address: undefined, match_length: 0, main_match_length: 0 }
    );

    formatted_address = placeResponseMatched.address.value;
  } else {
    const otherPlaceResponse = await fetchAddressFromGooglePlaceApi(inputQuery);

    if (!otherPlaceResponse.length) {
      return null;
    }

    formatted_address = otherPlaceResponse[0].formatted_address;
  }

  const description = formatted_address.split(", ").slice(-4).join(", ").trim();
  const descriptionExtracted = extractAddressInputData(description);

  return descriptionExtracted;
}

function fetchAddressFromGoogleAutocompleteApi(inputQuery) {
  const url = `${GOOGLE_MAP_AUTOCOMPLETE_API}?input=${inputQuery}&key=${GOOGLE_API_KEY}=&sessiontoken=1234567890`;

  return axios(encodeURI(url), {
    headers: {
      "Content-Type": "application/json",
    },
  }).then(
    (response) => {
      return response.data.predictions;
    },
    (error) => {
      console.log(error);

      return [];
    }
  );
}

function fetchAddressFromGooglePlaceApi(inputQuery) {
  const url = `${GOOGLE_MAP_PLACE_API}?query=${inputQuery}&key=${GOOGLE_API_KEY}`;

  return axios(encodeURI(url), {
    headers: {
      "Content-Type": "application/json",
    },
  }).then(
    (response) => {
      return response.data.results;
    },
    (error) => {
      console.log(error);

      return [];
    }
  );
}

function getStreetFromInputOriginal(input, address) {
  let indexOfStreet = 0;
  const inputConvert = util.xoa_dau(input).toLowerCase();
  const keys = getKeysFromAddressFound(address);

  keys.forEach((key, index) => {
    if (indexOfStreet > 0) {
      return;
    }

    const indexs = [];
    indexs.push(inputConvert.indexOf(key));

    switch (index) {
      case 0:
        indexs.push(inputConvert.indexOf(`xa ${key}`));
        indexs.push(inputConvert.indexOf(`x ${key}`));
        indexs.push(inputConvert.indexOf(`x. ${key}`));
        indexs.push(inputConvert.indexOf(`x.${key}`));
        indexs.push(inputConvert.indexOf(`phuong ${key}`));
        indexs.push(inputConvert.indexOf(`p ${key}`));
        indexs.push(inputConvert.indexOf(`p${key}`));
        indexs.push(inputConvert.indexOf(`p. ${key}`));
        indexs.push(inputConvert.indexOf(`p.${key}`));
        indexs.push(inputConvert.indexOf(`ph ${key}`));
        indexs.push(inputConvert.indexOf(`ph${key}`));
        indexs.push(inputConvert.indexOf(`ph. ${key}`));
        indexs.push(inputConvert.indexOf(`ph.${key}`));
        indexs.push(inputConvert.indexOf(`thi tran ${key}`));
        indexs.push(inputConvert.indexOf(`tt ${key}`));
        indexs.push(inputConvert.indexOf(`tt${key}`));
        indexs.push(inputConvert.indexOf(`tt. ${key}`));
        indexs.push(inputConvert.indexOf(`t.t. ${key}`));
        indexs.push(inputConvert.indexOf(`t.t ${key}`));
        indexs.push(inputConvert.indexOf(`t.t.${key}`));
        indexs.push(inputConvert.indexOf(`tt.${key}`));

        break;
      case 1:
        indexs.push(inputConvert.indexOf(`thi xa ${key}`));
        indexs.push(inputConvert.indexOf(`tx ${key}`));
        indexs.push(inputConvert.indexOf(`tx${key}`));
        indexs.push(inputConvert.indexOf(`tx. ${key}`));
        indexs.push(inputConvert.indexOf(`t.x. ${key}`));
        indexs.push(inputConvert.indexOf(`t.x ${key}`));
        indexs.push(inputConvert.indexOf(`t.x.${key}`));
        indexs.push(inputConvert.indexOf(`tx.${key}`));
        indexs.push(inputConvert.indexOf(`huyen ${key}`));
        indexs.push(inputConvert.indexOf(`h ${key}`));
        indexs.push(inputConvert.indexOf(`h${key}`));
        indexs.push(inputConvert.indexOf(`h.${key}`));
        indexs.push(inputConvert.indexOf(`h. ${key}`));
        indexs.push(inputConvert.indexOf(`quan ${key}`));
        indexs.push(inputConvert.indexOf(`q ${key}`));
        indexs.push(inputConvert.indexOf(`q${key}`));
        indexs.push(inputConvert.indexOf(`q. ${key}`));
        indexs.push(inputConvert.indexOf(`q.${key}`));
        indexs.push(inputConvert.indexOf(`tp.${key}`));
        indexs.push(inputConvert.indexOf(`tp. ${key}`));
        indexs.push(inputConvert.indexOf(`tp ${key}`));
        indexs.push(inputConvert.indexOf(`t.p.${key}`));
        indexs.push(inputConvert.indexOf(`t.p. ${key}`));
        indexs.push(inputConvert.indexOf(`t.p ${key}`));
        indexs.push(inputConvert.indexOf(`thanh pho ${key}`));

        if (key === "binh chanh") {
          indexs.push(inputConvert.indexOf(`binh tranh`));
        }

        break;
      case 2:
        indexs.push(inputConvert.indexOf(`tp.${key}`));
        indexs.push(inputConvert.indexOf(`tp. ${key}`));
        indexs.push(inputConvert.indexOf(`tp ${key}`));
        indexs.push(inputConvert.indexOf(`t.p.${key}`));
        indexs.push(inputConvert.indexOf(`t.p. ${key}`));
        indexs.push(inputConvert.indexOf(`t.p ${key}`));
        indexs.push(inputConvert.indexOf(`thanh pho ${key}`));
        indexs.push(inputConvert.indexOf(`tỉnh ${key}`));
        indexs.push(inputConvert.indexOf(`tinh ${key}`));
        indexs.push(inputConvert.indexOf(`t ${key}`));
        indexs.push(inputConvert.indexOf(`t. ${key}`));
        indexs.push(inputConvert.indexOf(`t.${key}`));

        if (key === "ho chi minh") {
          indexs.push(inputConvert.indexOf(`hcm`));
          indexs.push(inputConvert.indexOf(`h.c.m`));
          indexs.push(inputConvert.indexOf(`sg`));
          indexs.push(inputConvert.indexOf(`s.g`));
          indexs.push(inputConvert.indexOf(`tp.hcm`));
          indexs.push(inputConvert.indexOf(`tp. hcm`));
          indexs.push(inputConvert.indexOf(`tp hcm`));
          indexs.push(inputConvert.indexOf(`t.p.hcm`));
          indexs.push(inputConvert.indexOf(`t.p. hcm`));
          indexs.push(inputConvert.indexOf(`t.p hcm`));
          indexs.push(inputConvert.indexOf(`thanh pho hcm`));
          indexs.push(inputConvert.indexOf(`tp.h.c.m`));
          indexs.push(inputConvert.indexOf(`tp. h.c.m`));
          indexs.push(inputConvert.indexOf(`tp h.c.m`));
          indexs.push(inputConvert.indexOf(`t.p.h.c.m`));
          indexs.push(inputConvert.indexOf(`t.p. h.c.m`));
          indexs.push(inputConvert.indexOf(`t.p h.c.m`));
          indexs.push(inputConvert.indexOf(`thanh pho h.c.m`));
          indexs.push(inputConvert.indexOf(`tp.sg`));
          indexs.push(inputConvert.indexOf(`tp. sg`));
          indexs.push(inputConvert.indexOf(`tp sg`));
          indexs.push(inputConvert.indexOf(`t.p.sg`));
          indexs.push(inputConvert.indexOf(`t.p. sg`));
          indexs.push(inputConvert.indexOf(`t.p sg`));
          indexs.push(inputConvert.indexOf(`thanh pho sg`));
          indexs.push(inputConvert.indexOf(`tp.s.g`));
          indexs.push(inputConvert.indexOf(`tp. s.g`));
          indexs.push(inputConvert.indexOf(`tp s.g`));
          indexs.push(inputConvert.indexOf(`t.p.s.g`));
          indexs.push(inputConvert.indexOf(`t.p. s.g`));
          indexs.push(inputConvert.indexOf(`t.p s.g`));
          indexs.push(inputConvert.indexOf(`thanh pho s.g`));
          indexs.push(inputConvert.indexOf(`thanh pho sai gon`));
          indexs.push(inputConvert.indexOf(`sai gon`));
        }

        if (key === "ha noi") {
          indexs.push(inputConvert.indexOf(`hn`));
          indexs.push(inputConvert.indexOf(`h.n`));
          indexs.push(inputConvert.indexOf(`tp.hn`));
          indexs.push(inputConvert.indexOf(`tp. hn`));
          indexs.push(inputConvert.indexOf(`tp hn`));
          indexs.push(inputConvert.indexOf(`t.p.hn`));
          indexs.push(inputConvert.indexOf(`t.p. hn`));
          indexs.push(inputConvert.indexOf(`t.p hn`));
          indexs.push(inputConvert.indexOf(`thanh pho hn`));
          indexs.push(inputConvert.indexOf(`tp.h.n`));
          indexs.push(inputConvert.indexOf(`tp. h.n`));
          indexs.push(inputConvert.indexOf(`tp h.n`));
          indexs.push(inputConvert.indexOf(`t.p.h.n`));
          indexs.push(inputConvert.indexOf(`t.p. h.n`));
          indexs.push(inputConvert.indexOf(`t.p h.n`));
          indexs.push(inputConvert.indexOf(`thanh pho h.n`));
        }

        if (key === "da nang") {
          indexs.push(inputConvert.indexOf(`dn`));
          indexs.push(inputConvert.indexOf(`d.n`));
          indexs.push(inputConvert.indexOf(`tp.dn`));
          indexs.push(inputConvert.indexOf(`tp. dn`));
          indexs.push(inputConvert.indexOf(`tp dn`));
          indexs.push(inputConvert.indexOf(`t.p.dn`));
          indexs.push(inputConvert.indexOf(`t.p. dn`));
          indexs.push(inputConvert.indexOf(`t.p dn`));
          indexs.push(inputConvert.indexOf(`thanh pho dn`));
          indexs.push(inputConvert.indexOf(`tp.d.n`));
          indexs.push(inputConvert.indexOf(`tp. d.n`));
          indexs.push(inputConvert.indexOf(`tp d.n`));
          indexs.push(inputConvert.indexOf(`t.p.d.n`));
          indexs.push(inputConvert.indexOf(`t.p. d.n`));
          indexs.push(inputConvert.indexOf(`t.p d.n`));
          indexs.push(inputConvert.indexOf(`thanh pho d.n`));
        }

        break;
    }

    const indexFilter = indexs.filter((e) => e >= 0);
    let indexFound;

    if (indexFilter.length) {
      indexFound = Math.min.apply(
        Math,
        indexs.filter((e) => e >= 0)
      );
    } else {
      indexFound = -1;
    }

    indexOfStreet = indexFound > 0 ? indexFound : indexOfStreet;
  });

  if (!indexOfStreet) {
    return "";
  }

  return util.titleCase(
    input
      .slice(0, indexOfStreet)
      .replace(/[\s./\-,]$/, "")
      .replace(/[\s./\-,]$/, "")
      .trim()
  );
}

function extractAddressInputData(input) {
  const inputValue = input.replace(/(phố)/g, "");
  const regEx = /[\s./\-,]/g;
  const keys = util
    .xoa_dau(inputValue)
    .trim()
    .split(regEx)
    .filter((e) => e !== "");
  const outputKeys = keys
    .reduce((results, key) => {
      if (/\d/g.test(key)) {
        results.push(...key.replace(/\'/g, "").split(/(\d+)/).filter(Boolean));
      } else if (/[A-Z][a-z]+/g.test(key)) {
        results.push(...key.split(/(?=[A-Z])/));
      } else {
        results.push(key);
      }

      return results;
    }, [])
    .map((e) => e.toLowerCase());

  let checker = (arr, target) => target.every((v) => arr.includes(v));

  if (checker(keys, ["hn", "tphn"]) || outputKeys.includes("hanoi")) {
    outputKeys.push(...["ha", "noi", "hn", "tphn", "hanoi"]);
  }

  if (checker(keys, ["hcm", "tphcm"]) || outputKeys.includes("hochiminh")) {
    outputKeys.push(...["ho", "chi", "minh", "hcm", "tphcm", "hochiminh"]);
  }

  if (checker(keys, ["dn", "tpdn"]) || outputKeys.includes("danang")) {
    outputKeys.push(...["da", "nang", "dn", "tpdn", "danang"]);
  }

  return {
    value: input,
    keys: [...new Set(outputKeys)],
  };
}

function getKeysFromAddressFound(address) {
  return address.split(", ").map((e) => {
    e = e
      .replace(/^(P|TT|TX|TP|Q)/, "")
      .trim()
      .toLowerCase();

    return util.xoa_dau(e);
  });
}
