import { QuartzTransformerPlugin } from "../types"
import {
  FullSlug,
  RelativeURL,
  SimpleSlug,
  TransformOptions,
  stripSlashes,
  simplifySlug,
  splitAnchor,
  transformLink,
} from "../../util/path"
import path from "path"
import { visit } from "unist-util-visit"
import isAbsoluteUrl from "is-absolute-url"
import { Root } from "hast"

interface Options {}

const defaultOptions: Options = {}

export const AddFrontmatter: QuartzTransformerPlugin<Partial<Options>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  return {
    name: "AddFrontmatter",
    htmlPlugins(ctx) {
      return [
        () => {
          return (tree: Root, file) => {
            visit(tree, "element", (node, _index, _parent) => {
              const frontmatter = file.data.frontmatter as any
              // Get all code blocks
              if (node.tagName === "code") {
                node.children.forEach((child, index) => {
                  const childValue = (child as any).value
                  if (typeof childValue === "string") {
                    if (childValue.startsWith("=this.file.name")) {
                      // Remove this header since it's not needed
                      tree.children.splice(index, 1)
                      const toc = file.data.toc?.findIndex((x) => x.text === "=this.file.name")
                      file.data.toc?.splice(toc!, 1)
                    } else if (childValue.startsWith("=this.")) {
                      const extractedProperty = childValue.split("=this.")[1]
                      const frontmatterValue: any = frontmatter
                        ? frontmatter[extractedProperty]
                        : undefined
                      if (frontmatterValue) {
                        ;(node.children[index] as any).value = `${frontmatterValue}`
                      }
                    }
                  }
                })

                node.tagName = "span"
              }
            })
          }
        },
      ]
    },
  }
}

declare module "vfile" {
  interface DataMap {
    links: SimpleSlug[]
  }
}
