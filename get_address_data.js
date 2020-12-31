const fs = require("fs");
const xlsxFile = require("read-excel-file/node");
const util = require("./util");

console.log("Dang doc address tu file excel...");
xlsxFile("./address_vietnamese.xlsx").then((rows) => {
  console.log("Doc xong!");
  console.log("Trich xuat data address...");
  const data = mappingAddressToDataObject(rows);

  console.log("Ghi data vao file jon...");
  const json = JSON.stringify(data);
  fs.writeFile("data.json", json, "utf8", () => console.log("Da ghi xong!"));
});

function mappingAdrresValue(row) {
  return row
    .map((e, i) => {
      let value = e.replace(/^Xã|Huyện|Tỉnh/g, "");
      value = value.replace(/^Phường/g, "P");
      value = value.replace(/^Quận/g, "Q");
      value = value.replace(/^Thị trấn/g, "TT");
      value = value.replace(/^Thị Trấn/g, "TT");
      value = value.replace(/^Thị xã/g, "TX");
      value = value.replace(/^Thị Xã/g, "TX");

      if (i === 1) {
        value = value.replace(/^Thành phố/g, "TP");
        value = value.replace(/^Thành Phố/g, "TP");
      } else {
        value = value.replace(/^Thành phố/g, "");
      }

      return value.trim();
    })
    .join(", ");
}

function mappingAddressToDataObject(rows) {
  return rows.map((row) => {
    const result = {
      data: row,
      value: mappingAdrresValue(row),
      keys: null,
    };

    const ha_noi_keys = ["ha", "noi"];
    const ho_chi_minh_keys = ["ho", "chi", "minh"];
    const da_nang_keys = ["da", "nang"];

    const keys = row
      .map((item) => {
        if (/^(Thị trấn)/g.test(item)) {
          item = `${item} tt`;
        }

        if (/^(Thị xã)/g.test(item)) {
          item = `${item} tx`;
        }

        if (/^(Thành phố)/g.test(item)) {
          item = item.replace(/^(Thành phố)/g, "tp");
        }

        if (/\d/g.test(item)) {
          item = item
            .replace(/\'/g, "")
            .split(/(\d+)/)
            .filter(Boolean)
            .join(" ");
        }

        let value = util.xoa_dau(item).toLowerCase().trim();

        return value;
      })
      .join(" ")
      .split(/[\s./\-,]/g)
      .filter(Boolean);

    let checker = (arr, target) => target.every((v) => arr.includes(v));

    if (checker(keys, ha_noi_keys)) {
      keys.push(...["hn", "tphn"]);
    }
    if (checker(keys, ho_chi_minh_keys)) {
      keys.push(...["hcm", "sg", "sai", "gon", "tphcm"]);
    }
    if (checker(keys, da_nang_keys)) {
      keys.push(...["dn", "tpdn"]);
    }

    if (checker(keys, ["tranh"])) {
      keys.push("chanh");
    }

    result.keys = keys;

    return result;
  });
}
