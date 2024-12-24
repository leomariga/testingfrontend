import DashboardLayout from "@/layout/DashboardLayout.vue"
// GeneralViews
import NotFound from "@/pages/NotFoundPage.vue"

// Admin pages
import Overview from "@/pages/Overview.vue"
import UserProfile from "@/pages/UserProfile.vue"
import TableList from "@/pages/TableList.vue"
import Typography from "@/pages/Typography.vue"
import Icons from "@/pages/Icons.vue"
import Maps from "@/pages/Maps.vue"
import Notifications from "@/pages/Notifications.vue"
import Upgrade from "@/pages/Upgrade.vue"

const routes = [
  {
    path: "/",
    component: DashboardLayout,
    redirect: "/admin/overview",
    children: [
      {
        path: "admin/overview",
        name: "Overview",
        component: Overview,
      },
      {
        path: "admin/user",
        name: "User",
        component: UserProfile,
      },
      {
        path: "admin/table-list",
        name: "Table List",
        component: TableList,
      },
      {
        path: "admin/typography",
        name: "Typography",
        component: Typography,
      },
      {
        path: "admin/icons",
        name: "Icons",
        component: Icons,
      },
      {
        path: "admin/maps",
        name: "Maps",
        component: Maps,
      },
      {
        path: "admin/notifications",
        name: "Notifications",
        component: Notifications,
      },
      {
        path: "admin/upgrade",
        name: "Upgrade to PRO",
        component: Upgrade,
      },
    ],
  },
  {
    // Catch all route - must be at the end
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
]

/**
 * Asynchronously load view (Webpack Lazy loading compatible)
 * The specified component must be inside the Views folder
 * @param  {string} name  the filename (basename) of the view to load.
function view(name) {
   var res= require('../components/Dashboard/Views/' + name + '.vue');
   return res;
};**/

export default routes
