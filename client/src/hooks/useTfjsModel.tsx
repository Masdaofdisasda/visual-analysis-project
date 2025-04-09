import {useEffect, useState} from "react";
import {GraphModel, loadGraphModel} from "@tensorflow/tfjs";

function useTfjsModel() {
    const [model, setModel] = useState<GraphModel | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(function handleLoadGraphModel() {
        async function loadModel() {
        try {
            const model = await loadGraphModel('tfjs_model/model.json');
            setModel(model);
        } catch (error) {
            console.error('Error loading model:', error);
        } finally {
            setLoading(false);
        }
        }

        loadModel();
    }, []);

    return { model, loading };
}

export default useTfjsModel;
