import moment from "moment";

export function timeAgo(dateString: string) {
  return moment(dateString).fromNow();
}
