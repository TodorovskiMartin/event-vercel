import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "15s", target: 500 },
    { duration: "45s", target: 500 },
    { duration: "15s", target: 0 }
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1500"]
  }
};

const BASE_URL = __ENV.BASE_URL;
const EVENT_SLUG = __ENV.EVENT_SLUG;

export default function () {
  const res = http.get(`${BASE_URL}/e/${EVENT_SLUG}`);
  check(res, { "page ok": (r) => r.status === 200 });
  sleep(Math.random() * 2);
}
