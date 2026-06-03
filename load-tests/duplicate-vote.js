import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 2,
  thresholds: {
    http_req_failed: ["rate<0.01"]
  }
};

const songIds = (__ENV.SONG_IDS || "").split(",").filter(Boolean).slice(0, 3);

export default function () {
  const jar = http.cookieJar();
  jar.set(__ENV.BASE_URL, "event_voter_token", "k6-fixed-duplicate-token");
  const res = http.post(`${__ENV.BASE_URL}/api/public/events/${__ENV.EVENT_SLUG}/vote`, JSON.stringify({ songIds }), {
    headers: { "Content-Type": "application/json" }
  });
  check(res, { "accepted then rejected": (r) => [200, 409].includes(r.status) });
}
