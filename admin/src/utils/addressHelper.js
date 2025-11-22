import provinces from "../data/address/provinces.json";
import districts from "../data/address/districts.json";
import wards from "../data/address/wards.json";

export const getProvinceName = (code) =>
  provinces.find((p) => p.code === code)?.name || "";

export const getDistrictName = (code) =>
  districts.find((d) => d.code === code)?.name || "";

export const getWardName = (code) =>
  wards.find((w) => w.code === code)?.name || "";
