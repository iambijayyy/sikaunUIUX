import * as React from "react";
import { useEpisodeContext } from "src/contexts/episode/episode.context";
import { IMAGES_ROUTES } from "src/services/config";
import "./creator.scss";
import UserImage from "/public-assets/default-user.svg";

export default function EpisodeCreator() {
  const { course } = useEpisodeContext();
  const creator = course.creator;

  return (
    <div className="creator-info">
      <img
        src={
          course.creator.profileImage
            ? `${IMAGES_ROUTES}${course.creator.profileImage}`
            : { UserImage }
        }
      />
      <h3>
        {creator.name} {creator.lastName}
      </h3>
    </div>
  );
}
