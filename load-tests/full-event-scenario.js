import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    landing: { executor: "ramping-vus", stages: [{ duration: "20s", target: 500 }, { duration: "20s", target: 0 }] },
    polling: { executor: "constant-vus", vus: 500, duration: "2m", startTime: "30s" },
    voting: { executor: "shared-iterations", vus: 500, iterations: 500, startTime: "60s" }
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<1500"]
  }
};

const songIds = (__ENV.SONG_IDS || "").split(",").filter(Boolean).slice(0, 3);

export default function () {
  const page = http.get(`${__ENV.BASE_URL}/e/${__ENV.EVENT_SLUG}`);
  check(page, { "landing ok": (r) => r.status === 200 });
  const status = http.get(`${__ENV.BASE_URL}/api/public/events/${__ENV.EVENT_SLUG}/status`);
  check(status, { "status ok": (r) => r.status === 200 });
  const vote = http.post(`${__ENV.BASE_URL}/api/public/events/${__ENV.EVENT_SLUG}/vote`, JSON.stringify({ songIds }), {
    headers: { "Content-Type": "application/json" }
  });
  check(vote, { "vote ok or blocked by lifecycle": (r) => [200, 403, 409].includes(r.status) });
  sleep(7 + Math.random() * 2);
}
