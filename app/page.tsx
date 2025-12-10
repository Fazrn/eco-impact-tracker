"use client";
import { TrashIcon } from "@heroicons/react/24/outline";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { create } from "domain";

export default function DashboardPage() {

    const [habits, setHabits] = useState<any[]>([]);

    const [weeklyProgress, setWeeklyProgress] = useState(0);
    const [totalImpact, setTotalImpact] = useState(0);
    const [goals, setGoals] = useState<any[]>([]);
    const [showInput, setShowInput] = useState(false);
    const [newGoal, setNewGoal] = useState("");
    const [newHabit, setNewHabit] = useState("");
    const [heatMapData, setHeatMapData] = useState<{date: string, count: number, habitExists: boolean}[]>([]);

    const deleteGoal = async (id: number) => {
        const {error} = await supabase
        .from("goals")
        .delete()
        .eq("id", id)

        if (error) {
            console.log("Delete error:", error);
            return;
        }
        
        setGoals(goals.filter(goal => goal.id != id));
    }

    useEffect(() => {
        const fetchGoals = async() => {
            const {data, error} = await supabase
            .from("goals")
            .select("*")
            .order("id", {ascending: true})

            console.log("Data:", data);
            console.log("error:", error);

            if(!error && data) {
                setGoals(data);
            }
        }
        fetchGoals()
    },[])

    useEffect(() => {
        const fetchHabits = async() => {
            const {data, error} = await supabase
            .from("habits")
            .select("*")
            .order("id", {ascending: true})

            if(!error && data) {
                setHabits(data);
            }}
            fetchHabits()
        },[])

    useEffect(() => {
        let value = 0;
        const target = 42;
        const speed = 30;
        const timer = setInterval(() => {
            value++;
            setTotalImpact(value);
            if (value === target) clearInterval(timer);
        },speed)
        return() => clearInterval(timer);
    },[])

    useEffect(() => {
        setWeeklyProgress(calculateWeeklyProgress());
    }, [habits])

    useEffect(() => {
        const fetchHeatmapData = async () => {
            const days = getLast7Days();
            const {data, error} = await supabase
            .from("habit_entries")
            .select("*")
            .in("date", days)

            if(error) {
                console.log("heatmap fetch error:", error);
                return;
            }
            const counts = days.map(date => ({
                date,
                count: data.filter(entry => entry.date === date).length,
                habitExists: habits.length > 0,
            }))
            setHeatMapData(counts);
        }
        fetchHeatmapData();
    },[habits])

    const toggleHabit = async(id: number, currentValue: boolean) => {
        const newValue = !currentValue;

        const {error: updateError} = await supabase
        .from("habits")
        .update({done: newValue})
        .eq("id",id)

        if(updateError) {
            console.log("Update habit error:", updateError);
            return;
        }

        if(newValue === true) {
            const today = new Date().toISOString().slice(0,10);

            const {error: insertError} = await supabase
            .from("habit_entries")
            .insert([{habit_id: id, date: today}])

            if(insertError) {
                console.log("insert error:", insertError);
            }
        }

        if(newValue === false) {
            const today = new Date().toISOString().slice(0,10);

            const{error: deleteError} = await supabase
            .from("habit_entries")
            .delete()
            .eq("habit_id", id)
            .eq("date", today);

            if(deleteError) {
                console.log("delete error:", deleteError);
            }
        }


        const updated = habits.map((habit) =>
            habit.id === id ? {...habit, done: !habit.done} : habit
        );
        setHabits(updated);
    }

    const deleteHabit = async(id: number) => {
        const {error} = await supabase
        .from("habits")
        .delete()
        .eq("id", id)

        if (error) {
            console.log("Delete Habit error:", error)
            return;
        }
        setHabits(habits.filter(habit => habit.id != id));
    }

    const createHabit = async() => {
        if (newHabit.trim() === "") return;
        const {data, error} = await supabase
        .from("habits")
        .insert([{text: newHabit }])
        .select()

        if (error) {
            console.log("Insert habit error:", error);
            return;
        }
        setHabits([...habits, data[0]]);
        setNewHabit("");
    }

    const addGoal = async() => {
        if (newGoal.trim() === "") return;
        const {data, error} = await supabase
        .from("goals")
        .insert([{text: newGoal}])
        .select()
        if (error) {
            console.log("Insert error:", error);
            return;
        }
        setGoals([...goals, data[0]]);
        setNewGoal("");
        setShowInput(false);
    }

    const calculateWeeklyProgress = () => {
        if (habits.length === 0) return 0;

        const completed = habits.filter(h => h.done).length;
        const total = habits.length;
        return Math.round((completed / total) * 100);
    }

    const getLast7Days = () => {
        const days =[];
        for(let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().slice(0, 10));
        }
        return days;
    }

    const heatmapColor = (count: number, habitExists:boolean) => {
        if(count === 0) return "#E8F2FF";
        if(count === 1) return "#A8C7FF";
        if(count === 2) return "#6FA8FF";
        if(count === 3) return "#3C82F6";
        return "#1D4ED8";
    }

    const getWeekdayName = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {weekday: "short"});
    }

    return(
    <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Dashboard!</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white shadow rounded-lg">
                <h2 className="text-xl font-semibold mb-3 text-green-800">Today's Habits</h2>
                <div className="space-y-3">
                    {habits.map((habit) => (
                        <div key={habit.id} className="flex items-center justify-between border p-2">
                            <label className="flex items-center gap-3">
                                <input type="checkbox"
                                checked={habit.done}
                                onChange={() => toggleHabit(habit.id, habit.done)}
                                className="h-5 w-5 accent-green-600 cursor-pointer"
                                />
                                <span className={`transition-all duration-200 text-gray-800 ${habit.done ? "line-through text-gray-400" : ""}`}>{habit.text}</span>
                            </label>
                            <TrashIcon className="h-5 w-5 text-gray-500 cursor-pointer hover:text-red-500 transition" 
                            onClick={() => deleteHabit(habit.id)}/>
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-sm text-gray-500">Completed: {habits.filter(h => h.done).length} / {habits.length}</p>
            </div>
            <div className="p-6 bg-white shadow rounded-lg">
                    <h2 className="text-xl font-semibold mb-4 text-green-800">Add a new habit</h2>
                    <input type="text" value={newHabit} placeholder="Enter habit name" className="w-full border rounded mb-3 p-2 text-gray-800" onChange={(e) => setNewHabit(e.target.value)}
                    onKeyDown={(e) => {if(e.key === "Enter") createHabit(); }}/>
                    <button className="px-4 py-2 bg-green-600 text-white rounded"
                    onClick={createHabit}
                    >Create habit</button>
                </div>
            <div className="p-6 bg-white shadow rounded-lg">
                <h2 className="text-xl font-semibold mb-2 text-green-800">Weekly Progress</h2>
                <p className="text-xs text-gray-500 mb-2 uppercase">Last 7 days</p>
                <div className="mt-4">
                    <div className="flex justify-between mt-4">
                        {heatMapData.map((day) => (
                            <div className="flex flex-col items-center" key={day.date}>
                                <div
                                title={`${getWeekdayName(day.date)} - ${day.count} habits completed`}
                                className="h-8 w-8 rounded-md transition-all hover:scale-110 hover:shadow"
                                style={{ backgroundColor: heatmapColor(day.count, day.habitExists), 
                                    border: day.count === 0 ? "1px solid #d0d7e1" : "none"
                                }}
                                ></div>
                                <span className="text-[10px] text-gray-600 mt-1 uppercase tracking-wide">{getWeekdayName(day.date)}</span>
                            </div>
                        ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{weeklyProgress}% completed this week</p>
                </div>  
            </div>
            <div className="p-6 bg-white shadow rounded-lg">
                <h2 className="text-xl font-semibold mb-2 text-green-800">Upcoming Goals</h2>
                <button onClick={() => setShowInput(true)} className="text-green-800 mb-3 font-medium">
                    + Add Goal
                </button>
                {showInput && (
                    <div className="flex gap-2 mb-4">
                        <input placeholder="Add a new Goal" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} type="text" className="flex-1 p-2 border rounded text-green-900"
                        onKeyDown={(e) => {if(e.key === "Enter") addGoal(); }}/>
                        <button onClick={addGoal}
                        className="px-3 bg-green-600 rounded text-white">Add</button>
                    </div>
                )}
                <ul className="space-y-2">
                    {goals.map((goal) => 
                    (<li key={goal.id} className="p-3 bg-gray-50 border border-gray-200 rounded text-gray-800 flex justify-between items-center">
                        {goal.text}
                        <TrashIcon className="h-5 w-5 text-gray-500 cursor-pointer hover:text-red-500 transition" onClick={() => deleteGoal(goal.id)}/>
                    </li>))}
                </ul>
            </div>
            <div className="p-6 bg-white shadow rounded-lg">
                <h2 className="text-xl font-semibold mb-2 text-green-800">Total Impact</h2>
                <p className="font-bold text-4xl text-green-600">{totalImpact}</p>
                <p className="text-gray-600 mt-2">Eco actions completed</p>
            </div>
        </div>
    </div>); 
}