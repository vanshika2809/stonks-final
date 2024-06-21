import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Chat from "./Chat";

const UserTable = () => {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [localUsername, setLocalUsername] = useState("");

    const usernameFilter = router.query.username || "";
    const statusFilter = router.query.status || "";

    useEffect(() => {
        const page = parseInt(router.query.page, 10) || 1;
        setCurrentPage(page);
        setLocalUsername(usernameFilter);
    }, [router.query.page, router.query.username]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const response = await fetch(`https://665621609f970b3b36c4625e.mockapi.io/users`);
            const data = await response.json();
            setUsers(data);
            setLoading(false);
        };

        fetchData();
    }, [usernameFilter, statusFilter, currentPage]);

    useEffect(() => {
        console.log("Current State:", { usernameFilter, statusFilter, currentPage });
    }, [usernameFilter, statusFilter, currentPage]);

    const updateFilters = (filterUpdates) => {
        const newQuery = {
            ...router.query,
            ...filterUpdates,
            page: "1",
        };
        router.push({ pathname: router.pathname, query: newQuery }, undefined, {
            shallow: true,
        });
    };

    const handlePageChange = (page) => {
        router.push(
            {
                pathname: router.pathname,
                query: { ...router.query, page: String(page) },
            },
            undefined,
            { shallow: true }
        );
    };

    const handlePrevious = () => {
        setCurrentPage((prev) => {
            const newPage = prev > 1 ? prev - 1 : 1;
            router.push(
                {
                    pathname: router.pathname,
                    query: { ...router.query, page: String(newPage) },
                },
                undefined,
                { shallow: true }
            );
            return newPage;
        });
    };

    const handleNext = () => {
        setCurrentPage((prev) => {
            const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
            const newPage = prev < totalPages ? prev + 1 : totalPages;
            router.push(
                {
                    pathname: router.pathname,
                    query: { ...router.query, page: String(newPage) },
                },
                undefined,
                { shallow: true }
            );
            return newPage;
        });
    };

    const handleUsernameChange = (e) => {
        setLocalUsername(e.target.value);
    };

    const handleUsernameKeyPress = (e) => {
        if (e.key === "Enter") {
            updateFilters({ username: localUsername });
        }
    };

    const filteredUsers = users.filter(
        (user) =>
            user.username.toLowerCase().includes(localUsername.toLowerCase()) &&
            (statusFilter === "" || user.active.toString() === statusFilter)
    );

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        const aStartsWith = a.username.toLowerCase().startsWith(localUsername.toLowerCase());
        const bStartsWith = b.username.toLowerCase().startsWith(localUsername.toLowerCase());
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return 0;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);

    if (loading) return <p>Loading...</p>;

    return (
        <div className="flex flex-col items-center mt-8 mb-4 pb-4 w-full">
            <div className="overflow-x-auto w-full max-w-5xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="mb-4 flex flex-col sm:flex-row justify-between w-full">
                    <input
                        type="text"
                        placeholder="Filter by username..."
                        value={localUsername}
                        onChange={handleUsernameChange}
                        onKeyPress={handleUsernameKeyPress}
                        className="px-4 py-2 border rounded mb-2 sm:mb-0 w-full sm:w-auto sm:flex-grow mr-2 focus:outline-none focus:border-blue-500"
                    />
                    <select
                        className="px-4 py-2 border rounded w-full sm:w-48 focus:outline-none focus:border-blue-500"
                        value={statusFilter}
                        onChange={(e) => updateFilters({ status: e.target.value })}
                    >
                        <option value="">All</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-100">
                            <th scope="col" className="px-6 py-3 text-left text-lg font-semibold">Avatar</th>
                            <th scope="col" className="px-6 py-3 text-left text-lg font-semibold">Full Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-lg font-semibold">Username</th>
                            <th scope="col" className="px-6 py-3 text-left text-lg font-semibold">Created At</th>
                            <th scope="col" className="px-6 py-3 text-left text-lg font-semibold">Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((user) => (
                            <tr key={user.id} className="border-b border-gray-200">
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <img src={user.avatar} alt="Avatar" className="h-12 w-12 rounded-full" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.active ? "Active" : "Inactive"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-center mt-4">
                    <button onClick={handlePrevious} className="px-4 py-2 mx-1 rounded text-gray-700 bg-gray-200 hover:bg-gray-300">&lt;</button>
                    {[...Array(Math.ceil(sortedUsers.length / itemsPerPage)).keys()].map((page) => (
                        <button
                            key={page + 1}
                            onClick={() => handlePageChange(page + 1)}
                            className={`px-4 py-2 mx-1 rounded ${currentPage === page + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"} hover:bg-gray-300`}
                        >
                            {page + 1}
                        </button>
                    ))}
                    <button onClick={handleNext} className="px-4 py-2 mx-1 rounded text-gray-700 bg-gray-200 hover:bg-gray-300">&gt;</button>
                </div>
            </div>
            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none"
            >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M18 13a1 1 0 01-1 1h-6l-5 5V4a1 1 0 011-1h11a1 1 0 011 1v9z" /></svg>
            </button>
            {isChatOpen && (
                <div className="fixed bottom-20 right-4 w-80 h-96 bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col">
                    <div className="flex justify-between items-center p-2 border-b border-gray-200">
                        <h2 className="text-lg font-semibold">Chat</h2>
                        <button onClick={() => setIsChatOpen(false)} className="text-gray-600 hover:text-gray-800">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9l5-5m-5 5l-5-5m5 5v12" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 relative">
                        <Chat messages={messages} setMessages={setMessages} setIsChatOpen={setIsChatOpen} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserTable;
