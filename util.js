const axios = require("axios").default;

const GOOGLE_GET_AUTOCOMPLATE_API = `https://maps.googleapis.com/maps/api/place/autocomplete/json`;
const GOOGLE_GET_PLACE_API = `https://maps.googleapis.com/maps/api/place/textsearch/json`;
const GOOGLE_API_KEY = `AIzaSyBsE_T-oPWP9_gve-pX-2N1upj0G9UwIhg`;

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

function xoa_dau(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");

  return str;
}

function extractAddressInputData(input) {
  const inputValue = input.replace(/(phố)/g, "");
  const regEx = /[\s./\-,]/g;
  const keys = xoa_dau(inputValue)
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

async function fetchPlaceFromGoogleMapsApi(input, addressInputExtracted) {
  let formatted_address;

  const inputQuery = input
    .toLowerCase()
    .replace(/^(ấp|hẻm|xóm|xom|ap|hem)/g, "")
    .trim();

  const originURL = `${GOOGLE_GET_AUTOCOMPLATE_API}?input=${inputQuery}&key=${GOOGLE_API_KEY}=&sessiontoken=1234567890`;

  console.log(originURL);

  const placeResponse = await axios(encodeURI(originURL), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (placeResponse.data.predictions.length) {
    const placeResponseMatched = placeResponse.data.predictions.reduce(
      (result, data) => {
        const placeResponseExtracted = extractAddressInputData(
          data.description
        );

        console.log(placeResponseExtracted);

        const mainTextExtracted = extractAddressInputData(
          data.structured_formatting.main_text
        );

        const matchAdr = addressInputExtracted.keys.filter((e) => {
          return placeResponseExtracted.keys.indexOf(e) !== -1;
        });

        const matchMainText = addressInputExtracted.keys.filter((e) => {
          return mainTextExtracted.keys.indexOf(e) !== -1;
        });

        console.log(matchAdr);
        console.log(matchMainText);

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
    const url = `${GOOGLE_GET_PLACE_API}?query=${inputQuery}&key=${GOOGLE_API_KEY}`;

    const otherPlaceResponse = await axios(encodeURI(url), {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!otherPlaceResponse.data.results.length) {
      return null;
    }

    formatted_address = otherPlaceResponse.data.results[0].formatted_address;
  }

  const description = formatted_address.split(", ").slice(-4).join(", ").trim();
  const descriptionExtracted = extractAddressInputData(description);

  return descriptionExtracted;
}

function getStreetFromInputOriginal(input, address) {
  let indexOfStreet = 0;
  const inputConvert = xoa_dau(input).toLowerCase();
  const keys = getKeysFromAddressFound(address);
  console.log(inputConvert);

  keys.forEach((key, index) => {
    if (indexOfStreet > 0) {
      return;
    }

    const indexs = [];

    indexs.push(inputConvert.indexOf(key));

    switch (index) {
      case 0:
        indexs.push(inputConvert.indexOf(`xã ${key}`));
        indexs.push(inputConvert.indexOf(`xa ${key}`));
        indexs.push(inputConvert.indexOf(`x ${key}`));
        indexs.push(inputConvert.indexOf(`x${key}`));
        indexs.push(inputConvert.indexOf(`x. ${key}`));
        indexs.push(inputConvert.indexOf(`x.${key}`));
        indexs.push(inputConvert.indexOf(`phường ${key}`));
        indexs.push(inputConvert.indexOf(`phương ${key}`));
        indexs.push(inputConvert.indexOf(`phuong ${key}`));
        indexs.push(inputConvert.indexOf(`p${key}`));
        indexs.push(inputConvert.indexOf(`p ${key}`));
        indexs.push(inputConvert.indexOf(`p. ${key}`));
        indexs.push(inputConvert.indexOf(`p.${key}`));
        indexs.push(inputConvert.indexOf(`ph ${key}`));
        indexs.push(inputConvert.indexOf(`ph${key}`));
        indexs.push(inputConvert.indexOf(`ph. ${key}`));
        indexs.push(inputConvert.indexOf(`ph.${key}`));
        indexs.push(inputConvert.indexOf(`thị trấn ${key}`));
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
        indexs.push(inputConvert.indexOf(`thị xã ${key}`));
        indexs.push(inputConvert.indexOf(`tx ${key}`));
        indexs.push(inputConvert.indexOf(`tx${key}`));
        indexs.push(inputConvert.indexOf(`tx. ${key}`));
        indexs.push(inputConvert.indexOf(`t.x. ${key}`));
        indexs.push(inputConvert.indexOf(`t.x ${key}`));
        indexs.push(inputConvert.indexOf(`t.x.${key}`));
        indexs.push(inputConvert.indexOf(`tx.${key}`));
        indexs.push(inputConvert.indexOf(`huyện ${key}`));
        indexs.push(inputConvert.indexOf(`huyen ${key}`));
        indexs.push(inputConvert.indexOf(`h ${key}`));
        indexs.push(inputConvert.indexOf(`h${key}`));
        indexs.push(inputConvert.indexOf(`h.${key}`));
        indexs.push(inputConvert.indexOf(`h. ${key}`));
        indexs.push(inputConvert.indexOf(`quận ${key}`));
        indexs.push(inputConvert.indexOf(`quan ${key}`));
        indexs.push(inputConvert.indexOf(`q ${key}`));
        indexs.push(inputConvert.indexOf(`q${key}`));
        indexs.push(inputConvert.indexOf(`q. ${key}`));
        indexs.push(inputConvert.indexOf(`q.${key}`));
        indexs.push(inputConvert.indexOf(`tp.${key}`));
        indexs.push(inputConvert.indexOf(`tp. ${key}`));
        indexs.push(inputConvert.indexOf(`tp ${key}`));
        indexs.push(inputConvert.indexOf(`tp${key}`));
        indexs.push(inputConvert.indexOf(`t.p.${key}`));
        indexs.push(inputConvert.indexOf(`t.p. ${key}`));
        indexs.push(inputConvert.indexOf(`t.p ${key}`));
        indexs.push(inputConvert.indexOf(`thành phố ${key}`));
        indexs.push(inputConvert.indexOf(`thanh pho ${key}`));

        break;
      case 2:
        indexs.push(inputConvert.indexOf(`tp.${key}`));
        indexs.push(inputConvert.indexOf(`tp. ${key}`));
        indexs.push(inputConvert.indexOf(`tp ${key}`));
        indexs.push(inputConvert.indexOf(`tp${key}`));
        indexs.push(inputConvert.indexOf(`t.p.${key}`));
        indexs.push(inputConvert.indexOf(`t.p. ${key}`));
        indexs.push(inputConvert.indexOf(`t.p ${key}`));
        indexs.push(inputConvert.indexOf(`thành phố ${key}`));
        indexs.push(inputConvert.indexOf(`thanh pho ${key}`));
        indexs.push(inputConvert.indexOf(`tỉnh ${key}`));
        indexs.push(inputConvert.indexOf(`tinh ${key}`));
        indexs.push(inputConvert.indexOf(`t ${key}`));
        indexs.push(inputConvert.indexOf(`t${key}`));
        indexs.push(inputConvert.indexOf(`t. ${key}`));
        indexs.push(inputConvert.indexOf(`t.${key}`));

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

  return titleCase(
    input
      .slice(0, indexOfStreet)
      .replace(/[\s./\-,]$/, "")
      .replace(/[\s./\-,]$/, "")
      .trim()
  );
}

function getKeysFromAddressFound(address) {
  return address.split(", ").map((e) => {
    e = e
      .replace(/^(P|TT|TX|TP)/, "")
      .trim()
      .toLowerCase();

    return xoa_dau(e);
  });
}

function toLowerCaseInputOriginal(input) {
  const regEx = /[\s./\-,]/g;
  const keys = input
    .trim()
    .split(regEx)
    .filter((e) => e !== "");

  return keys
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
    .join(" ");
}

function titleCase(str) {
  var splitStr = str.toLowerCase().split(" ");
  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }

  return splitStr.join(" ");
}
