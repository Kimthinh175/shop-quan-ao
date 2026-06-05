let ctrl = "home";
let act = "add";

if (typeof ctrl === "function") {
  try {
    let temp = new ctrl();
    if (typeof temp.act() == "function") {
      temp.act();
    }
  } catch (e) {
    throw e;
  }
}
