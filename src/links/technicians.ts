import { defineLink, DefineLinkExport } from "@medusajs/framework/utils";
import OrderModule from "@medusajs/medusa/order";
import TECHNICIAN_MODULE from "../modules/technicians";

let link: DefineLinkExport | null = null;
link = defineLink({ linkable: OrderModule.linkable.order, isList: true }, {
    linkable: TECHNICIAN_MODULE.linkable.technician,

});

export default link;

