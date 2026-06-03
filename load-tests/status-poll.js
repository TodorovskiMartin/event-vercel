import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 500,
  duration: "3m",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<600"]
  }
};

export default function () {
  const res = http.get(`${__ENV.BASE_URL}/api/public/events/${__ENV.EVENT_SLUG}/status`);
  check(res, { "status ok": (r) => r.status === 200 });
  sleep(7 + Math.random() * 2);
}
