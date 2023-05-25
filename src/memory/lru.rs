use std::collections::{HashMap, VecDeque};

use crate::{ConversationHistory, ConversationHistoryError};

pub struct LRUCache {
    capacity: usize,
    cache: HashMap<String, String>,
    history: VecDeque<String>,
}

impl LRUCache {
    pub fn new(capacity: Option<usize>) -> LRUCache {
        LRUCache {
            capacity: capacity.unwrap_or(12),
            cache: HashMap::new(),
            history: VecDeque::new(),
        }
    }

    fn remove_oldest_entry(&mut self) {
        if let Some(key) = self.history.pop_front() {
            self.cache.remove(&key);
        }
    }

    /// TODO: Implement calculate_similarity
    fn calculate_similarity(_query: &str, _turn: &str) -> f64 {
        0.0
    }

    fn get_size(&self) -> usize {
        self.history.len()
    }
}

impl ConversationHistory for LRUCache {
    fn add_turn(
        &mut self,
        _memory_policy: String,
        turn: String,
    ) -> Result<(), ConversationHistoryError> {
        if self.get_size() >= self.capacity {
            self.remove_oldest_entry();
        }

        self.history.push_back(turn.clone());
        self.cache.insert(turn.clone(), turn);
        Ok(())
    }

    fn retrieve_history(
        &mut self,
        _memory_policy: String,
        query: String,
    ) -> Result<Vec<String>, ConversationHistoryError> {
        let mut history_scores: Vec<(String, f64)> = self
            .history
            .iter()
            .map(|turn| (turn.clone(), LRUCache::calculate_similarity(&query, turn)))
            .collect();

        history_scores.sort_by(|(_, score1), (_, score2)| score2.partial_cmp(score1).unwrap());

        let relevant_history: Vec<String> = history_scores.into_iter().map(|(turn, _)| turn).collect();
        Ok(relevant_history)
    }
}

#[cfg(test)]
mod tests {
    use crate::{memory::lru::LRUCache, ConversationHistory, ConversationHistoryError};

    #[test]
    fn test_add_turn() {
        let mut cache = LRUCache::new(Some(2));
        cache.add_turn("lru".to_string(), "Value 1".to_string()).map_err(|e| return ConversationHistoryError::InternalError(e.to_string())).ok();
        cache.add_turn("lru".to_string(), "Value 2".to_string()).map_err(|e| ConversationHistoryError::InternalError(e.to_string())).ok();
        assert_eq!(cache.get_size(), 2);
    }
}
