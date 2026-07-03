import { POST_QUERY_RESULT } from "@/sanity/types"

type CategoriesProps = {
  categories: NonNullable<POST_QUERY_RESULT>["categories"]
}

export function Categories({ categories }: CategoriesProps) {
  return categories.map((category) => (
    <span
      key={category._id}
      className="bg-cyan-50 rounded-full px-2 py-1 leading-none whitespace-nowrap text-sm font-semibold text-cyan-700"
    >
      {category.title}
    </span>
  ))
}
