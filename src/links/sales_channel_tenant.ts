import { defineLink } from "@medusajs/framework/utils";
import TECHNICIAN_MODULE from "../modules/technicians";
import SalesChannelModule from "@medusajs/medusa/sales-channel";

export default defineLink(
    TECHNICIAN_MODULE.linkable.tenant,
    SalesChannelModule.linkable.salesChannel,
);

