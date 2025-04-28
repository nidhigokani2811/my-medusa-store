import { defineLink, DefineLinkExport } from "@medusajs/framework/utils";
import OrderModule from "@medusajs/medusa/order";
import TECHNICIAN_MODULE from "../modules/technicians";

let link: DefineLinkExport | null = null;
link = defineLink(OrderModule.linkable.order, {
    linkable: TECHNICIAN_MODULE.linkable.technician,
    deleteCascade: true,
});

export default link;

