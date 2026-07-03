import { POST_QUERY_RESULT } from "@/sanity/types"

type CategoriesProps = {
  categories: NonNullable<POST_QUERY_RESULT>["categories"]
}

export function Categories({ categories }: CategoriesProps) {
  return categories.map((category) => (
    <span
      key={category._id}
      className="text-xs font-semibold tracking-wide uppercase whitespace-nowrap text-accent"
    >
      {category.title}
    </span>
  ))
}
