"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: 'src/config/config.env' });
const express_1 = __importDefault(require("express"));
const hpp_1 = __importDefault(require("hpp"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const csp_1 = __importDefault(require("./middleware/csp"));
const inputSanitation_1 = __importDefault(require("./middleware/inputSanitation"));
const app = (0, express_1.default)();
app.use(express_1.default.json()); // Request body parser
app.use((0, helmet_1.default)());
app.use((0, hpp_1.default)());
app.use(csp_1.default); // Content security policy
app.use(inputSanitation_1.default); // Input sanitation
app.use((0, cors_1.default)({ origin: ['https://dev.franklintn.gov', 'https://apps.franklintn.gov', 'http://cofasv38'] })); // CORS
const routes_1 = __importDefault(require("./routes"));
(0, routes_1.default)(app); // Mount routes
app.use('/api/v2/dept-purchasing/api-docs', (req, res, next) => {
    res.redirect('https://documenter.getpostman.com/view/6104227/2sAYdhHV3F');
});
app.use(errorHandler_1.default);
const port = process.env.PORT;
app.set('port', port);
app.listen({ port }, async () => {
    console.log(`Server up on ${process.env.HOST}:${port} in ${process.env.NODE_ENV} mode..`);
});
//# sourceMappingURL=app.js.map