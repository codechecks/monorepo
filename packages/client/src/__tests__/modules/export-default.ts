/* tslint:disable */
export default function() {
  console.log("TEST", __filename);
  (global as any)[__filename] = true;
}
