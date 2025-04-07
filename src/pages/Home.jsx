import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeFeed, setFeed } from "../utils/feedSlice";
import { sendPushNotification } from "../utils/notification";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { getApiData, postApi } from "../utils/api";

const Home = () => {
  // const dispatch = useDispatch()
  const [toUserId, setToUserId] = useState(null);
  const [status, setStatus] = useState("");
  const user = useSelector((store) => store.user);

  const queryClient = useQueryClient();
  const { ref, inView } = useInView({ threshold: 1 });

  const feed = useSelector((store) => store.feed);

  const getFeed = async ({ pageParam }) => {
    const { data } = await getApiData("/feed?page=" + pageParam);
    return data;
  };

  // const {data, isLoading} = useQuery({queryKey: ["feed"], queryFn: getFeed});
  // console.log("get data ",data);

  const {
    data,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: getFeed,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage?.data?.length === 0) return undefined;
      return allPages.length + 1;
    },
    refetchOnWindowFocus: false,
  });
  // console.log("infinite feed data", data?.pages[0]?.data);
  // console.log("infinite feed data 2 ", data);

  useEffect(() => {
    if (inView && hasNextPage && !isFetching && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, inView]);

  const handleRequest = async ({ touser, status }) => {
    const res = await postApi(`/request/send/${status}/${touser._id}`, {});
    if (status === "interested") {
      const title = "New connection request.";
      const linkUrl = `/requests`;
      const text = `${
        user.firstName + " " + user.lastName
      } send connection request.`;
      const targetUserId = res.data.data.toUserId;
      sendPushNotification(targetUserId, title, text, linkUrl);
    }
    // console.log(res.data);
    return res.data;
  };

  const mutation = useMutation({
    mutationKey: ["feed"],
    mutationFn: handleRequest,
    onError: (error) => {
      console.error("sending request mutation failed", error.message);
      toast.error("error sending request");
    },
    onSuccess: (variables) => {
      queryClient.setQueryData(["feed"], (old) => ({
        pages: old?.pages.map((page) => ({
          ...page,
          data: page.data.filter((item) => item?._id !== variables.touser?._id),
        })),
        pageParams: old.pageParams,
      }));
    },
  });

  // const handleRequest = async (touser,status) => {
  //     try {
  //         const res = await axios.post(`${BASE_URL}/request/send/${status}/${touser._id}`, {},{withCredentials: true});
  //         // console.log(res.data.data);
  //         if(status === "interested"){
  //           const title = "New connection request.";
  //           const linkUrl = `/requests`
  //           const text = `${user.firstName + " " + user.lastName} send connection request.`
  //           const targetUserId = res.data.data.toUserId;
  //           sendPushNotification(targetUserId,title, text, linkUrl);
  //         }
  //         dispatch(removeFeed(res.data.data.toUserId));
  //     } catch (error) {
  //         console.error(error);
  //     }
  // }

  // if(isLoading) return <div>Loading...</div>
  // if(!feed) return <div>Loading...</div>
  // if(feed.length === 0) return <div className='text-center m-5' >No more available users.</div>
  const allUsers = data?.pages?.flatMap((page) => page.data) || [];
  if (allUsers?.length === 0)
    return <div className="text-center m-5">No more available users.</div>;

  return (
    <>
      <div className="flex">
        <div className="mx-auto">
          {/* {data?.data?.map((touser,index) => { */}
          {allUsers.map((touser, index) => {
            return (
              <div
                key={index}
                className="card bg-base-200 md:w-96 max-w-96 shadow-sm m-4"
              >
                <figure className="px-10 pt-10">
                  <img
                    src={touser.photoUrl}
                    alt="Shoes"
                    className="rounded-xl w-full h-64 object-cover"
                  />
                </figure>
                <div className="card-body items-center text-center">
                  <h2 className="card-title">
                    {touser.firstName + " " + touser.lastName}
                  </h2>
                  <p className="mb-2">{touser.about}</p>
                  <div className="card-actions">
                    <button
                      onClick={() =>
                        mutation.mutate({ touser, status: "interested" })
                      }
                      // onClick={()=>handleRequest(touser,"interested")}
                      status="Interested"
                      className="btn btn-primary"
                    >
                      Interested
                    </button>
                    <button
                      onClick={() =>
                        mutation.mutate({ touser, status: "ignored" })
                      }
                      //  onClick={()=>handleRequest(touser,"ignored")}
                      status="Ignore"
                      className="btn btn-secondary"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* <button ref={ref} onClick={() => fetchNextPage()}  > next </button> */}
          <div className="flex justify-center m-2">
            <button ref={ref} disabled={!hasNextPage || isFetchingNextPage}>
              {isFetchingNextPage
                ? "Loading more..."
                : hasNextPage
                ? "Load Newer"
                : "Nothing more to load"}
            </button>
          </div>
          {/* {isFetchingNextPage && <div>Loading more ...</div>} */}
        </div>
      </div>
    </>
  );
};

export default Home;
