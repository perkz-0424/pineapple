
import user from "@/modules/db/user";
import request from "@/modules/request";
import common from "@/modules/db/common";
import routes from "@/modules/db/routes";
import plan from "@/modules/db/plan";
import plans from "@/modules/db/plans";

const cloudDb = {
    user,
    request,
    common,
    routes,
    plan,
    plans,
}
export default cloudDb;