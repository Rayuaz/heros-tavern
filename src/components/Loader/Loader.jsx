export default function Loader({ className }) {
    return (
        <div className={`loader ${className}`}>
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
        </div>
    );
}
