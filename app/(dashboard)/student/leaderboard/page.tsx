import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getProfile } from "@/lib/supabase/auth-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Flame, BookOpen } from "lucide-react";

export default async function LeaderboardPage() {
  const profile = await getProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  const students = await db.profile.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      lessonProgress: {
        where: { isCompleted: true },
        select: { id: true },
      },
      certificates: {
        select: { id: true },
      },
    },
  });

  const leaderboard = students
    .map((s) => ({
      id: s.id,
      name: s.name,
      imageUrl: s.imageUrl,
      lessonsCompleted: s.lessonProgress.length,
      certificates: s.certificates.length,
      points: s.lessonProgress.length * 10 + s.certificates.length * 100,
    }))
    .filter((s) => s.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 20);

  const myRank = leaderboard.findIndex((s) => s.id === profile.id) + 1;
  const myStats = leaderboard.find((s) => s.id === profile.id);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>;
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-[#F5A623]" />
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Top learners ranked by points (10 pts per lesson, 100 pts per certificate)
        </p>
      </div>

      {/* My Stats */}
      {myStats && (
        <Card className="border-[#1D6FF2]/30 bg-[#1D6FF2]/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1D6FF2]/10 flex items-center justify-center">
                  <span className="font-bold text-[#1D6FF2]">
                    {myStats.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{myStats.name} (You)</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {myStats.lessonsCompleted} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {myStats.certificates} certs
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-[#1D6FF2] text-white">Rank #{myRank}</Badge>
                <p className="text-sm font-bold mt-1">{myStats.points} pts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Top Learners
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No activity yet. Be the first on the leaderboard!
            </p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((student, i) => {
                const rank = i + 1;
                const isMe = student.id === profile.id;

                return (
                  <div
                    key={student.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isMe ? "bg-[#1D6FF2]/5 border border-[#1D6FF2]/20" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="w-8 flex justify-center">
                      {getRankIcon(rank)}
                    </div>
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {student.imageUrl ? (
                        <img
                          src={student.imageUrl}
                          alt={student.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {student.name}
                        {isMe && <span className="text-[#1D6FF2] ml-1">(You)</span>}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{student.lessonsCompleted} lessons</span>
                        <span>{student.certificates} certs</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">{student.points}</span>
                      <span className="text-xs text-muted-foreground ml-1">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
