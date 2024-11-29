import "dotenv/config";
import App from "./app";
import { IndexRoute } from "./modules/index";
import { validateEnv } from "@core/utils";
import { UserRoute } from "@modules/users";
import { AuthRoute } from "@modules/auth";
import { ProfileRoute } from "@modules/profile";
import { PostRoute } from "@modules/posts";
import { GroupRoute } from "@modules/groups";
import { ChatRoute } from "@modules/chats";

validateEnv();

const routes = [
  new IndexRoute(),
  new UserRoute(),
  new AuthRoute(),
  new ProfileRoute(),
  new PostRoute(),
  new GroupRoute(),
  new ChatRoute(),
];

const app = new App(routes);

app.listen();
