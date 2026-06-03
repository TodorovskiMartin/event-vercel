import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 500,
  iterations: 500,
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<1500"]
  }
};

const songIds = (__ENV.SONG_IDS || "").split(",").filter(Boolean);

export default function () {
  const selected = songIds.slice(0, 3);
  const res = http.post(`${__ENV.BASE_URL}/api/public/events/${__ENV.EVENT_SLUG}/vote`, JSON.stringify({ songIds: selected }), {
    headers: {
      "Content-Type": "application/json",
      "x-load-voter": `vu-${__VU}-iter-${__ITER}`
    }
  });
  check(res, { "vote accepted or duplicate": (r) => [200, 409].includes(r.status) });
  sleep(Math.random());
}
