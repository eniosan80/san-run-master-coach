import { useState } from "react";

type ExerciseMedia = {
  type: "animation" | "video";
  src: string;
  poster?: string;
  alt: string;
};

interface ExerciseDemoProps {
  media?: ExerciseMedia;
  exerciseName: string;
  color?: string;
}

export default function ExerciseDemo({
  media,
  exerciseName,
  color = "#C4622D",
}: ExerciseDemoProps) {
  const [imageError, setImageError] = useState(false);

  /*
   * Enquanto a animação real não existir,
   * mostramos um estado visual de preparação.
   */
  if (!media || imageError) {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "16 / 10",
          borderRadius: 18,
          overflow: "hidden",
          position: "relative",
          background:
            "radial-gradient(circle at 50% 42%, rgba(196,98,45,0.16), transparent 45%), #111116",
          border: "1px solid rgba(196,98,45,0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              margin: "0 auto 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color,
              background: `${color}16`,
              border: `1px solid ${color}35`,
              fontSize: "1.4rem",
            }}
          >
            ▶
          </div>

          <p
            style={{
              margin: "0 0 5px",
              color: "#F5F0EB",
              fontSize: "0.78rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Demonstração
          </p>

          <p
            style={{
              margin: 0,
              color: "#88858A",
              fontSize: "0.68rem",
            }}
          >
            Animação San Run em preparação
          </p>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 14,
            right: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "#77747A",
              fontSize: "0.58rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {exerciseName}
          </span>

          <span
            style={{
              color,
              fontSize: "0.55rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            SAN RUN
          </span>
        </div>
      </div>
    );
  }

  if (media.type === "video") {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "16 / 10",
          borderRadius: 18,
          overflow: "hidden",
          background: "#111116",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <video
          src={media.src}
          poster={media.poster}
          autoPlay
          muted
          loop
          playsInline
          controls
          onError={() => setImageError(true)}
          aria-label={media.alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "16 / 10",
        borderRadius: 18,
        overflow: "hidden",
        background: "#111116",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <img
        src={media.src}
        alt={media.alt}
        onError={() => setImageError(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
}