import ImageApi from "./Api";
import Controller from "./Controller";
import Storage from "./Storage";
import Model from "./Model";
import View from "./View";
import ModalManager from "./ModalManager";
import imgViewFunc from "../templates/imgview.hbs";

export default class App {
  constructor() {
    const storage = Storage.create("pictureFinder");
    const model = new Model(storage);
    const view = new View();
    this.controller = new Controller(model, view);
    this.controller.service = new ImageApi();
    const backdrop = document.querySelector('.js-backdrop');
    const modal = document.querySelector('.js-modal');
    ModalManager.create(view, backdrop, modal, imgViewFunc);
  }
}
