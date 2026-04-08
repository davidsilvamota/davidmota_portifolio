import React from "react"
import { screen } from "@testing-library/react"
import { render } from "./test-utils"
import { App } from "./App"

test("renders profile name", () => {
  render(<App />)
  expect(screen.getByText("David Mota")).toBeInTheDocument()
})
