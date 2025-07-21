
import { getAllPosts } from "@/lib/api";
import MoreStories from "../more-stories";

export const dynamic = "force-static"


const PostPage = async ({ params }: any) => {
  const morePosts = await getAllPosts( true);

  return (
    <div className="container mx-auto px-5 max-w-5xl">

      <MoreStories morePosts={morePosts} />
    </div>
  );
}

export default PostPage;