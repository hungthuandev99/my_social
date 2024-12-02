import mongoose from "mongoose";
import { Route } from "@core/interfaces";
import express from "express";
import hpp from "hpp";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import { Logger } from "@core/utils";
import { errorHandleMiddleware } from "@core/middleware";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import socketIo from "socket.io";
import http from "http";

class App {
  public app: express.Application;
  public port: string | number;
  public production: boolean;
  public server: http.Server;
  public io: socketIo.Server;

  constructor(routes: Route[]) {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new socketIo.Server(this.server);

    this.port = process.env.PORT || 3000;
    this.production = process.env.NODE_ENV == "production" ? true : false;

    this.connectToDatabase();
    this.initializeMiddleware();
    this.initializeRoutes(routes);
    this.initializeErrorMiddleware();
    this.initializeSwagger();
    this.initializeSocketIo();
  }

  public listen() {
    this.server.listen(this.port, () => {
      Logger.info(`Server is listening on port ${this.port}`);
    });
  }

  private initializeRoutes(routes: Route[]) {
    routes.forEach((route) => {
      this.app.use("/api/v1/", route.router);
    });
  }

  private initializeMiddleware() {
    if (this.production) {
      this.app.use(hpp());
      this.app.use(helmet());
      this.app.use(morgan("combined"));
      this.app.use(cors({ origin: "your.domain.com", credentials: true }));
    } else {
      this.app.use(morgan("dev"));
      this.app.use(cors({ origin: true, credentials: true }));
    }

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeErrorMiddleware() {
    this.app.use(errorHandleMiddleware);
  }

  private connectToDatabase() {
    const connectString = process.env.MONGODB_URI;
    if (!connectString) {
      Logger.error("Connect string invalid");
      return;
    }
    mongoose.connect(connectString).catch((reason) => {
      Logger.error(reason);
    });
    Logger.info("Database connected...");
  }
  private initializeSwagger() {
    const swaggerDocument = YAML.load("./src/swagger.yaml");
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument)
    );
  }
  private initializeSocketIo() {
    this.server = http.createServer(this.app);
    this.io = new socketIo.Server(this.server, {
      cors: { origin: "*" },
    });
    this.app.set("socketio", this.io);

    const users: any = {};
    this.io.on("connection", (socket: socketIo.Socket) => {
      Logger.warn("a user connected : " + socket.id);
      socket.emit("message", "Hello " + socket.id);

      socket.on("login", function (data) {
        Logger.warn("a user " + data.userId + " connected");
        // saving userId to object with socket ID
        users[socket.id] = data.userId;
      });

      socket.on("disconnect", function () {
        Logger.warn("user " + users[socket.id] + " disconnected");
        // remove saved socket from users object
        delete users[socket.id];
        Logger.warn("socket disconnected : " + socket.id);
      });
    });
  }
}

export default App;
