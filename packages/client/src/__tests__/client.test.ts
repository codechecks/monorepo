import { CodechecksClient } from "../client";
import { Api } from "../api";
import { contextFixture, reportFixture } from "./fixtures";

jest.mock("../api");
jest.mock("../logger");

describe("CodechecksClient", () => {
  it("counts failed and succeeded reports", async () => {
    const client = new CodechecksClient(new Api({}), contextFixture());
    await client.report(reportFixture({ status: "success" }));
    await client.report(reportFixture({ status: "failure" }));
    await client.report(reportFixture({ status: "success" }));
    expect(client.countSuccesses()).toEqual(2);
    expect(client.countFailures()).toEqual(1);
  });
});
